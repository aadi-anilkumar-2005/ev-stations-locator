import { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Zap, Clock, AlertCircle, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import * as React from "react";

// ─── Configuration ────────────────────────────────────────────────────────────
const OPEN_HOUR = 6.0;
const CLOSE_HOUR = 22.0;
const STEP = 0.5;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getLocalISODate = (d: Date): string => {
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split("T")[0];
};

const formatTime = (num: number): string => {
  const h = Math.floor(num);
  const m = num % 1 !== 0 ? "30" : "00";
  const ampm = h >= 12 && h < 24 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m} ${ampm}`;
};

const formatTimeShort = (num: number): string => {
  const h = Math.floor(num);
  const m = num % 1 !== 0 ? "30" : "00";
  const displayH = h % 12 || 12;
  return `${displayH}:${m}`;
};

const formatDuration = (num: number): string => {
  if (num === 0.5) return "30 Mins";
  if (num === 1) return "1 Hour";
  return `${num} Hours`;
};

const toTimeStr = (decimalHour: number): string => {
  const h = Math.floor(decimalHour);
  const m = decimalHour % 1 !== 0 ? 30 : 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
};

const parseDecimalHour = (timeStr: string): number => {
  const parts = timeStr.split(":");
  return parseInt(parts[0]) + parseInt(parts[1]) / 60;
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface DateItem {
  dateStr: string;
  dayName: string;
  dayNum: number;
  monthName: string;
}

interface TimeSlot {
  hour: number;
  isBooked: boolean;
  isPast: boolean;
  isSelected: boolean;
  isInRange: boolean;
}

interface ApiBooking {
  id: number;
  station_id: number;
  station_name: string;
  station_charger: number;
  charger_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: string;
  total_price: string;
  status: string;
  created_at: string;
}

interface UserActiveBooking {
  id: number;
  charger_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: string;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const { token } = useAuth();
  const isDark = theme === "dark";

  const stationId = params.stationId ? Number(params.stationId) : null;
  const stationName = params.stationName as string | undefined;

  // ── State ──────────────────────────────────────────────────────────────────
  const todayObj = useMemo(() => new Date(), []);
  const today = useMemo(() => getLocalISODate(todayObj), [todayObj]);

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedCharger, setSelectedCharger] = useState<any | null>(null);
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  // API-driven availability state
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [chargerRate, setChargerRate] = useState<number>(150);
  const [stationChargerId, setStationChargerId] = useState<number | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // If the user already has a confirmed booking at this station, we block new ones
  const [userActiveBooking, setUserActiveBooking] = useState<UserActiveBooking | null>(null);

  // Full booking history list for this station
  const [myBookings, setMyBookings] = useState<ApiBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Station Chargers
  const [stationChargers, setStationChargers] = useState<any[]>([]);
  const [stationLoading, setStationLoading] = useState(false);

  useEffect(() => {
    if (stationId) loadStationDetails(stationId);
  }, [stationId]);

  const loadStationDetails = async (id: number) => {
    setStationLoading(true);
    try {
      const data = await api.getStationDetails(id);
      if (data.place_chargers && data.place_chargers.length > 0) {
        setStationChargers(data.place_chargers);
        const first = data.place_chargers[0];
        setSelectedCharger(first);
        setSelectedStartHour(null);
        setSelectedDuration(null);
        setChargerRate(parseFloat(first.start_price) || 150);
      }
    } catch (e) {
      console.error("Failed to load station chargers", e);
    } finally {
      setStationLoading(false);
    }
  };

  // ── Load booking history on mount ─────────────────────────────────────────
  useEffect(() => {
    if (token) loadMyBookings();
  }, [token]);

  const loadMyBookings = async () => {
    setBookingsLoading(true);
    try {
      const data = await api.getMyBookings();
      const confirmed = stationId
        ? data.filter((b: ApiBooking) => b.station_id === stationId && b.status === "confirmed")
        : data.filter((b: ApiBooking) => b.status === "confirmed");
      setMyBookings(confirmed);
    } catch (e) {
      console.error("Failed to load bookings", e);
    } finally {
      setBookingsLoading(false);
    }
  };

  // ── Fetch availability when date or charger changes ───────────────────────
  useEffect(() => {
    if (!selectedDate || !selectedCharger || !stationId) {
      setBookedSlots([]);
      setUserActiveBooking(null);
      return;
    }
    fetchAvailability(selectedDate, selectedCharger.id);
  }, [selectedDate, selectedCharger, stationId]);

  const fetchAvailability = async (date: string, chargerId: number) => {
    if (!stationId) return;
    setAvailabilityLoading(true);
    try {
      const data = await api.getBookingAvailability(stationId, date, chargerId);
      if (data) {
        setBookedSlots(data.booked_slots);
        const rate = parseFloat(data.charger_rate);
        setChargerRate(isNaN(rate) || rate === 0 ? parseFloat(selectedCharger.start_price) || 150 : rate);
        setStationChargerId(data.station_charger_id);
        // This tells us if the user already has a confirmed booking at this station
        setUserActiveBooking(data.user_active_booking ?? null);
      }
    } catch (e) {
      console.error("Availability fetch error", e);
      setBookedSlots([]);
      setChargerRate(parseFloat(selectedCharger.start_price) || 150);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const dateList = useMemo<DateItem[]>(() => {
    const list: DateItem[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(todayObj);
      d.setDate(todayObj.getDate() + i);
      list.push({
        dateStr: getLocalISODate(d),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    return list;
  }, [todayObj]);

  const allSlots = useMemo<TimeSlot[]>(() => {
    if (!selectedCharger) return [];
    const now = new Date();
    const currentDecimalHour = now.getHours() + now.getMinutes() / 60;
    const isToday = selectedDate === today;
    const slots: TimeSlot[] = [];

    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h += STEP) {
      const hRounded = Math.round(h * 10) / 10;
      const booked = bookedSlots.some((s: number) => Math.abs(s - hRounded) < 0.01);
      const isPast = isToday && hRounded <= currentDecimalHour;
      const isSelected = selectedStartHour !== null && Math.abs(selectedStartHour - hRounded) < 0.01;
      const isInRange =
        selectedStartHour !== null &&
        selectedDuration !== null &&
        hRounded >= selectedStartHour &&
        hRounded < selectedStartHour + selectedDuration;
      slots.push({ hour: hRounded, isBooked: booked, isPast, isSelected, isInRange });
    }
    return slots;
  }, [selectedCharger, selectedDate, today, bookedSlots, selectedStartHour, selectedDuration]);

  const availableStartSlots = useMemo<TimeSlot[]>(
    () => allSlots.filter((s: TimeSlot) => !s.isBooked && !s.isPast),
    [allSlots]
  );

  const maxDurationFromStart = useMemo(() => {
    if (selectedStartHour === null) return 0;
    let max = 0;
    for (let h = selectedStartHour; h < CLOSE_HOUR; h += STEP) {
      const hR = Math.round(h * 10) / 10;
      if (bookedSlots.some((s: number) => Math.abs(s - hR) < 0.01)) break;
      max += STEP;
    }
    return Math.round(max * 10) / 10;
  }, [selectedStartHour, bookedSlots]);

  const durationOptions = useMemo<number[]>(() => {
    const opts: number[] = [];
    for (let d = STEP; d <= maxDurationFromStart; d += STEP) {
      opts.push(Math.round(d * 10) / 10);
    }
    return opts;
  }, [maxDurationFromStart]);

  const totalPrice = useMemo(() => {
    if (selectedDuration === null) return 0;
    return chargerRate * selectedDuration;
  }, [chargerRate, selectedDuration]);

  // Block form if user already has an active booking at this station
  const isBlockedByActiveBooking = userActiveBooking !== null;

  const isReadyToBook =
    !isBlockedByActiveBooking &&
    !!selectedDate &&
    !!selectedCharger &&
    selectedStartHour !== null &&
    selectedDuration !== null &&
    (stationId ? stationChargerId !== null : true);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChargerSelect = (charger: any) => {
    setSelectedCharger(charger);
    setSelectedStartHour(null);
    setSelectedDuration(null);
    setChargerRate(parseFloat(charger.start_price) || 150);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedStartHour(null);
    setSelectedDuration(null);
  };

  const handleStartHourSelect = (hour: number) => {
    setSelectedStartHour(hour);
    setSelectedDuration(null);
  };

  const handleBook = async () => {
    if (!isReadyToBook) return;
    if (!token) {
      Alert.alert("Login Required", "Please log in to book a charger.", [
        { text: "OK", onPress: () => router.push("/(auth)/login" as any) },
      ]);
      return;
    }
    setProcessing(true);
    try {
      await api.createBooking({
        station_charger: stationChargerId!,
        booking_date: selectedDate,
        start_time: toTimeStr(selectedStartHour!),
        end_time: toTimeStr(selectedStartHour! + selectedDuration!),
        duration_hours: selectedDuration!,
        total_price: totalPrice.toFixed(2),
      });
      await Promise.all([
        fetchAvailability(selectedDate, selectedCharger.id),
        loadMyBookings(),
      ]);
      setSuccessVisible(true);
    } catch (e: any) {
      Alert.alert("Booking Failed", e.message || "Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelBooking = (bookingId: number, summary: string) => {
    Alert.alert(
      "Cancel Booking",
      `Cancel your booking for ${summary}?`,
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await api.cancelBooking(bookingId);
              // Immediately unblock new bookings
              setUserActiveBooking(null);
              await Promise.all([
                loadMyBookings(),
                selectedCharger
                  ? fetchAvailability(selectedDate, selectedCharger.id)
                  : Promise.resolve(),
              ]);
            } catch (e: any) {
              Alert.alert("Error", e.message || "Could not cancel booking.");
            }
          },
        },
      ]
    );
  };

  const handleDoneAfterSuccess = () => {
    setSuccessVisible(false);
    setSelectedStartHour(null);
    setSelectedDuration(null);
  };

  // ── Theme tokens ───────────────────────────────────────────────────────────
  const bg = isDark ? "#111827" : "#f4f7f6";
  const cardBg = isDark ? "#1f2937" : "#ffffff";
  const textColor = colors.text;
  const subtleText = colors.textSecondary;
  const borderColor = isDark ? "#374151" : "#e9ecef";
  const inputBg = isDark ? "#374151" : "#f8f9fa";

  const summaryDateLabel = (() => {
    const d = new Date(selectedDate + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  })();

  const summaryTimeLabel =
    selectedStartHour !== null && selectedDuration !== null
      ? `${formatTime(selectedStartHour)} – ${formatTime(selectedStartHour + selectedDuration)}`
      : "—";

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: cardBg, borderBottomColor: borderColor },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={textColor} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerBrand}>⚡ ChargeSpot</Text>
          <Text style={[styles.headerSub, { color: subtleText }]}>
            {stationName ? `Book at ${stationName}` : "Book a Charger"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Active Booking Banner ──────────────────────────────
            Shown when the user already has a confirmed booking at this station.
            They must cancel before they can make a new one.
        ─────────────────────────────────────────────────────── */}
        {userActiveBooking !== null && (() => {
          const startH = parseDecimalHour(userActiveBooking.start_time);
          const endH = parseDecimalHour(userActiveBooking.end_time);
          const dateLabel = new Date(userActiveBooking.booking_date + "T00:00:00").toLocaleDateString(
            "en-IN", { weekday: "short", month: "short", day: "numeric" }
          );
          return (
            <View
              style={[
                styles.activeBookingBanner,
                { backgroundColor: isDark ? "#422006" : "#fff7ed", borderColor: "#f97316" },
              ]}
            >
              <View style={styles.activeBookingHeader}>
                <Text style={styles.activeBookingTitle}>🔒 You Have an Active Booking Here</Text>
                <Text style={[styles.activeBookingSubtitle, { color: subtleText }]}>
                  Cancel your existing booking to make a new one at this station.
                </Text>
              </View>
              <View style={[styles.activeBookingDetails, { backgroundColor: isDark ? "#1f2937" : "#fff", borderColor }]}>
                <View style={styles.activeBookingRow}>
                  <Text style={[styles.activeBookingLabel, { color: subtleText }]}>Charger</Text>
                  <Text style={[styles.activeBookingValue, { color: textColor }]}>{userActiveBooking.charger_name}</Text>
                </View>
                <View style={styles.activeBookingRow}>
                  <Text style={[styles.activeBookingLabel, { color: subtleText }]}>Date</Text>
                  <Text style={[styles.activeBookingValue, { color: textColor }]}>{dateLabel}</Text>
                </View>
                <View style={styles.activeBookingRow}>
                  <Text style={[styles.activeBookingLabel, { color: subtleText }]}>Time</Text>
                  <Text style={[styles.activeBookingValue, { color: textColor }]}>
                    {formatTime(startH)} – {formatTime(endH)}
                  </Text>
                </View>
                <View style={[styles.activeBookingRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.activeBookingLabel, { color: subtleText }]}>Total</Text>
                  <Text style={[styles.activeBookingValue, { color: "#10b981", fontWeight: "800" }]}>
                    ₹{parseFloat(userActiveBooking.total_price).toFixed(2)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.cancelActiveBanner}
                onPress={() =>
                  handleCancelBooking(
                    userActiveBooking.id,
                    `${userActiveBooking.charger_name} on ${dateLabel}`
                  )
                }
              >
                <Trash2 size={16} color="#fff" />
                <Text style={styles.cancelBtnText}>Cancel This Booking</Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        {/* ── My Bookings List ────────────────────────────────── */}
        {(myBookings.length > 0 || bookingsLoading) && (
          <SectionCard title="All My Bookings" cardBg={cardBg} borderColor={borderColor} textColor={textColor}>
            {bookingsLoading ? (
              <ActivityIndicator color="#10b981" style={{ marginVertical: 8 }} />
            ) : (
              myBookings.map((b: ApiBooking, index: number) => {
                const isLast = index === myBookings.length - 1;
                const startH = parseDecimalHour(b.start_time);
                const endH = parseDecimalHour(b.end_time);
                const dateLabel = new Date(b.booking_date + "T00:00:00").toLocaleDateString(
                  "en-IN", { weekday: "short", month: "short", day: "numeric" }
                );
                const summary = `${b.charger_name} on ${dateLabel}`;
                return (
                  <View
                    key={b.id}
                    style={[
                      styles.myBookingItem,
                      {
                        borderBottomColor: borderColor,
                        borderBottomWidth: isLast ? 0 : 1,
                        paddingBottom: isLast ? 0 : 16,
                        marginBottom: isLast ? 0 : 16,
                      },
                    ]}
                  >
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ color: textColor, fontWeight: "600", fontSize: 14 }}>
                        {b.station_name} · {b.charger_name}
                      </Text>
                      <Text style={{ color: subtleText, fontSize: 13, marginTop: 3 }}>
                        {dateLabel} · {formatTime(startH)} – {formatTime(endH)}
                      </Text>
                      <Text style={{ color: "#10b981", fontSize: 13, fontWeight: "700", marginTop: 2 }}>
                        ₹{parseFloat(b.total_price).toFixed(2)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleCancelBooking(b.id, summary)}
                      style={styles.cancelBtn}
                    >
                      <Trash2 size={16} color="#fff" />
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </SectionCard>
        )}

        {/* ── Select Date ─────────────────────────────────────── */}
        <SectionCard title="Select Date" cardBg={cardBg} borderColor={borderColor} textColor={textColor}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {dateList.map((item: DateItem) => {
                const active = selectedDate === item.dateStr;
                return (
                  <TouchableOpacity
                    key={item.dateStr}
                    onPress={() => handleDateSelect(item.dateStr)}
                    style={[
                      styles.dateCard,
                      {
                        borderColor: active ? "#10b981" : borderColor,
                        backgroundColor: active ? "#10b981" : cardBg,
                      },
                    ]}
                  >
                    <Text style={[styles.dateDayName, { color: active ? "#d1fae5" : subtleText }]}>
                      {item.dayName}
                    </Text>
                    <Text style={[styles.dateDayNum, { color: active ? "#fff" : textColor }]}>
                      {item.dayNum}
                    </Text>
                    <Text style={[styles.dateMonth, { color: active ? "#d1fae5" : subtleText }]}>
                      {item.monthName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SectionCard>

        {/* ── Charger Type ─────────────────────────────────────── */}
        <SectionCard title="Charger Type" cardBg={cardBg} borderColor={borderColor} textColor={textColor}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {stationLoading ? (
                <View style={{ padding: 12 }}>
                  <ActivityIndicator color="#10b981" />
                </View>
              ) : stationChargers.map((charger) => {
                const isDC = charger.name.toLowerCase().includes("dc") || charger.max_power_kw >= 50;
                return (
                  <ChargerTypeCard
                    key={`charger-${charger.id}`}
                    label={charger.name}
                    sub={`₹${parseFloat(charger.start_price).toFixed(0)}/hr`}
                    tag={isDC ? "DC" : "AC"}
                    tagColor={isDC ? "#3b82f6" : "#10b981"}
                    tagBg={isDC ? (isDark ? "#1e3a8a" : "#eff6ff") : (isDark ? "#064e3b" : "#ecfdf5")}
                    selected={selectedCharger?.id === charger.id}
                    selectedBorderColor={isDC ? "#3b82f6" : "#10b981"}
                    borderColor={borderColor}
                    cardBg={cardBg}
                    textColor={textColor}
                    subtleText={subtleText}
                    onPress={() => handleChargerSelect(charger)}
                  />
                );
              })}
              {stationChargers.length === 0 && !stationLoading && (
                <Text style={{ color: subtleText, padding: 8 }}>No chargers available</Text>
              )}
            </View>
          </ScrollView>
        </SectionCard>

        {/* ── Availability Timeline ─────────────────────────────── */}
        <SectionCard
          title="Availability Schedule"
          badge="6AM–10PM"
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
        >
          {!selectedCharger ? (
            <EmptyPlaceholder
              text="Select a Date & Charger to view schedule"
              inputBg={inputBg}
              borderColor={borderColor}
              subtleText={subtleText}
            />
          ) : availabilityLoading ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator color="#10b981" />
              <Text style={{ color: subtleText, marginTop: 8, fontSize: 13 }}>
                Loading availability…
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.timelineGrid}>
                {allSlots.map((slot: TimeSlot) => {
                  let slotBg = "#10b981";
                  let slotTc = "#fff";
                  if (slot.isBooked || slot.isPast) {
                    slotBg = isDark ? "#374151" : "#e9ecef";
                    slotTc = isDark ? "#6b7280" : "#adb5bd";
                  } else if (slot.isInRange || slot.isSelected) {
                    slotBg = "#2563eb";
                  }
                  return (
                    <View key={slot.hour} style={[styles.timeBlock, { backgroundColor: slotBg }]}>
                      <Text
                        style={[
                          styles.timeBlockText,
                          {
                            color: slotTc,
                            textDecorationLine: slot.isBooked || slot.isPast ? "line-through" : "none",
                          },
                        ]}
                      >
                        {formatTimeShort(slot.hour)}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={[styles.legend, { borderTopColor: borderColor }]}>
                <LegendDot color="#10b981" label="Free" textColor={subtleText} />
                <LegendDot color={isDark ? "#374151" : "#e9ecef"} label="Taken" textColor={subtleText} />
                <LegendDot color="#2563eb" label="Selected" textColor={subtleText} />
              </View>
            </>
          )}
        </SectionCard>

        {/* ── Start Time ──────────────────────────────────────── */}
        <SectionCard title="Start Time" cardBg={cardBg} borderColor={borderColor} textColor={textColor}>
          {availableStartSlots.length === 0 ? (
            <EmptyPlaceholder
              text={selectedCharger ? "No available slots for this date" : "Select a Date & Charger first"}
              inputBg={inputBg}
              borderColor={borderColor}
              subtleText={subtleText}
            />
          ) : (
            <View style={styles.pillsWrap}>
              {availableStartSlots.map((slot: TimeSlot) => {
                const active = selectedStartHour !== null && Math.abs(selectedStartHour - slot.hour) < 0.01;
                return (
                  <TouchableOpacity
                    key={slot.hour}
                    onPress={() => handleStartHourSelect(slot.hour)}
                    style={[
                      styles.timePill,
                      {
                        backgroundColor: active ? "#2563eb" : cardBg,
                        borderColor: active ? "#2563eb" : borderColor,
                      },
                    ]}
                  >
                    <Text style={[styles.timePillText, { color: active ? "#fff" : textColor }]}>
                      {formatTime(slot.hour)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </SectionCard>

        {/* ── Duration ─────────────────────────────────────────── */}
        <SectionCard title="Duration" cardBg={cardBg} borderColor={borderColor} textColor={textColor}>
          {durationOptions.length === 0 ? (
            <EmptyPlaceholder
              text="Select a Start Time first"
              inputBg={inputBg}
              borderColor={borderColor}
              subtleText={subtleText}
            />
          ) : (
            <>
              <View style={styles.durationGrid}>
                {durationOptions.map((dur: number) => {
                  const active = selectedDuration !== null && Math.abs(selectedDuration - dur) < 0.01;
                  const endH = (selectedStartHour ?? 0) + dur;
                  return (
                    <TouchableOpacity
                      key={dur}
                      onPress={() => setSelectedDuration(dur)}
                      style={[
                        styles.durationCard,
                        {
                          backgroundColor: active ? (isDark ? "#1e3a8a" : "#eff6ff") : cardBg,
                          borderColor: active ? "#2563eb" : borderColor,
                        },
                      ]}
                    >
                      <Text style={[styles.durationLabel, { color: active ? "#2563eb" : textColor }]}>
                        {formatDuration(dur)}
                      </Text>
                      <Text style={[styles.durationSub, { color: active ? "#60a5fa" : subtleText }]}>
                        Until {formatTimeShort(endH)}
                      </Text>
                      <Text style={[styles.durationPrice, { color: active ? "#2563eb" : subtleText }]}>
                        ₹{(chargerRate * dur).toFixed(0)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {selectedStartHour !== null && selectedStartHour + maxDurationFromStart < CLOSE_HOUR && (
                <View style={[styles.hint, { backgroundColor: isDark ? "#422006" : "#fff7ed", borderColor: "#f97316" }]}>
                  <AlertCircle size={14} color="#f97316" />
                  <Text style={styles.hintText}>Duration limited due to an upcoming booking.</Text>
                </View>
              )}
            </>
          )}
        </SectionCard>

        {/* ── Booking Summary ──────────────────────────────────── */}
        <View style={[styles.summaryBox, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.summaryTitle, { color: textColor }]}>Booking Summary</Text>
          <SummaryRow label="Station" value={stationName ?? "—"} textColor={textColor} subtleText={subtleText} />
          <SummaryRow label="Date" value={summaryDateLabel} textColor={textColor} subtleText={subtleText} />
          <SummaryRow label="Time" value={summaryTimeLabel} textColor={textColor} subtleText={subtleText} />
          <SummaryRow
            label="Charger"
            value={selectedCharger ? selectedCharger.name : "—"}
            textColor={textColor}
            subtleText={subtleText}
          />
          <View style={[styles.summaryDivider, { backgroundColor: borderColor }]} />
          <View style={styles.summaryTotal}>
            <Text style={[styles.summaryTotalLabel, { color: textColor }]}>Total Amount:</Text>
            <Text style={styles.priceText}>₹{totalPrice.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky Bottom Bar ──────────────────────────────────── */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + 16, backgroundColor: cardBg, borderTopColor: borderColor },
        ]}
      >
        {isBlockedByActiveBooking ? (
          <View style={[styles.blockedBar, { borderColor: "#f97316", backgroundColor: isDark ? "#422006" : "#fff7ed" }]}>
            <Text style={{ color: "#f97316", fontWeight: "700", textAlign: "center", fontSize: 14 }}>
              Cancel your active booking above to make a new one
            </Text>
          </View>
        ) : (
          <View style={styles.bottomBarInner}>
            <View>
              <Text style={[styles.bottomBarSub, { color: subtleText }]}>
                {selectedStartHour !== null && selectedDuration !== null ? summaryTimeLabel : "Select a time slot"}
              </Text>
              <Text style={styles.priceText}>₹{totalPrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.bookBtn,
                { backgroundColor: isReadyToBook ? "#10b981" : isDark ? "#374151" : "#d1fae5" },
              ]}
              onPress={handleBook}
              disabled={!isReadyToBook || processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.bookBtnText, { color: isReadyToBook ? "#fff" : "#6b7280" }]}>
                  Confirm Booking →
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Success Modal ──────────────────────────────────────── */}
      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardBg }]}>
            <Text style={{ fontSize: 64 }}>✅</Text>
            <Text style={[styles.modalTitle, { color: textColor }]}>Booking Confirmed!</Text>
            <Text style={[styles.modalSub, { color: subtleText }]}>
              Your EV charger slot has been successfully secured.
            </Text>
            <TouchableOpacity
              style={[styles.modalDoneBtn, { borderColor }]}
              onPress={handleDoneAfterSuccess}
            >
              <Text style={[styles.modalDoneBtnText, { color: textColor }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  badge?: string;
  children?: React.ReactNode;
  cardBg: string;
  borderColor: string;
  textColor: string;
}

function SectionCard({ title, badge, children, cardBg, borderColor, textColor }: SectionCardProps) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
        {badge ? (
          <View style={[styles.sectionBadge, { borderColor }]}>
            <Text style={[styles.sectionBadgeText, { color: textColor }]}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

interface ChargerTypeCardProps {
  label: string; sub: string; tag: string; tagColor: string; tagBg: string;
  selected: boolean; selectedBorderColor: string; borderColor: string;
  cardBg: string; textColor: string; subtleText: string; onPress: () => void;
}

function ChargerTypeCard({
  label, sub, tag, tagColor, tagBg, selected, selectedBorderColor,
  borderColor, cardBg, textColor, subtleText, onPress,
}: ChargerTypeCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chargerTypeCard,
        {
          borderColor: selected ? selectedBorderColor : borderColor,
          backgroundColor: cardBg,
          shadowColor: selected ? selectedBorderColor : "transparent",
          shadowOpacity: selected ? 0.15 : 0,
          shadowRadius: 8,
          elevation: selected ? 4 : 0,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.chargerTypeTop}>
        <Zap size={28} color={selected ? selectedBorderColor : subtleText} strokeWidth={2} />
        <View style={[styles.chargerTypeTag, { backgroundColor: tagBg }]}>
          <Text style={[styles.chargerTypeTagText, { color: tagColor }]}>{tag}</Text>
        </View>
      </View>
      <Text style={[styles.chargerTypeLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.chargerTypeSub, { color: subtleText }]}>{sub}</Text>
    </TouchableOpacity>
  );
}

function EmptyPlaceholder({ text, inputBg, borderColor, subtleText }: {
  text: string; inputBg: string; borderColor: string; subtleText: string;
}) {
  return (
    <View style={[styles.emptyPlaceholder, { backgroundColor: inputBg, borderColor }]}>
      <Clock size={32} color={subtleText} strokeWidth={1.5} />
      <Text style={[styles.emptyText, { color: subtleText }]}>{text}</Text>
    </View>
  );
}

function SummaryRow({ label, value, textColor, subtleText }: {
  label: string; value: string; textColor: string; subtleText: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: subtleText }]}>{label}:</Text>
      <Text style={[styles.summaryValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

function LegendDot({ color, label, textColor }: { color: string; label: string; textColor: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1 },
  headerBrand: { fontSize: 18, fontWeight: "800", color: "#10b981" },
  headerSub: { fontSize: 12, marginTop: 1 },

  sectionCard: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  sectionBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  sectionBadgeText: { fontSize: 11, fontWeight: "600" },

  // Active booking banner
  activeBookingBanner: {
    borderRadius: 16, borderWidth: 2, padding: 16, marginBottom: 14,
  },
  activeBookingHeader: { marginBottom: 12 },
  activeBookingTitle: { fontSize: 15, fontWeight: "800", color: "#f97316", marginBottom: 4 },
  activeBookingSubtitle: { fontSize: 13 },
  activeBookingDetails: {
    borderRadius: 12, borderWidth: 1, marginBottom: 14, overflow: "hidden",
  },
  activeBookingRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)",
  },
  activeBookingLabel: { fontSize: 13 },
  activeBookingValue: { fontSize: 13, fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  cancelActiveBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#ef4444", paddingVertical: 12, borderRadius: 10,
  },

  myBookingItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cancelBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#ef4444", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  cancelBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  dateCard: {
    minWidth: 62, borderRadius: 14, borderWidth: 2, padding: 10, alignItems: "center",
  },
  dateDayName: { fontSize: 11, fontWeight: "700" },
  dateDayNum: { fontSize: 22, fontWeight: "800", marginVertical: 2 },
  dateMonth: { fontSize: 10 },

  chargerTypeCard: {
    flex: 1, borderWidth: 2, borderRadius: 14, padding: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  chargerTypeTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  chargerTypeTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  chargerTypeTagText: { fontSize: 11, fontWeight: "700" },
  chargerTypeLabel: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  chargerTypeSub: { fontSize: 12 },

  timelineGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 },
  timeBlock: { width: 44, paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  timeBlockText: { fontSize: 10, fontWeight: "700" },

  legend: {
    flexDirection: "row", justifyContent: "center", gap: 20,
    marginTop: 12, paddingTop: 10, borderTopWidth: 1,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 12, fontWeight: "500" },

  pillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timePill: { borderWidth: 2, borderRadius: 30, paddingHorizontal: 14, paddingVertical: 9 },
  timePillText: { fontSize: 13, fontWeight: "600" },

  durationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  durationCard: { width: "30%", borderWidth: 2, borderRadius: 12, padding: 12, alignItems: "center" },
  durationLabel: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  durationSub: { fontSize: 10, marginTop: 3, textAlign: "center" },
  durationPrice: { fontSize: 11, fontWeight: "700", marginTop: 4 },
  hint: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 10, padding: 10, borderRadius: 8, borderWidth: 1,
  },
  hintText: { fontSize: 12, fontWeight: "600", flex: 1, color: "#ea580c" },

  summaryBox: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  summaryTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  summaryDivider: { height: 1, marginVertical: 10 },
  summaryTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryTotalLabel: { fontSize: 15, fontWeight: "700" },
  priceText: { fontSize: 24, fontWeight: "800", color: "#10b981" },

  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, paddingTop: 12, paddingHorizontal: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 8,
  },
  bottomBarInner: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", gap: 12,
  },
  blockedBar: {
    borderRadius: 12, borderWidth: 1.5, padding: 14,
  },
  bottomBarSub: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  bookBtn: { flex: 1, borderRadius: 50, paddingVertical: 13, alignItems: "center" },
  bookBtnText: { fontSize: 15, fontWeight: "700" },

  emptyPlaceholder: {
    borderWidth: 2, borderStyle: "dashed", borderRadius: 12,
    padding: 24, alignItems: "center", gap: 10,
  },
  emptyText: { fontSize: 13, textAlign: "center" },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  modalCard: {
    borderRadius: 24, padding: 32, alignItems: "center",
    width: "100%", maxWidth: 320,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 12,
  },
  modalTitle: { fontSize: 22, fontWeight: "800", marginTop: 16, textAlign: "center" },
  modalSub: { fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 20 },
  modalDoneBtn: {
    borderWidth: 1.5, borderRadius: 50,
    paddingVertical: 12, paddingHorizontal: 40, marginTop: 20,
  },
  modalDoneBtnText: { fontSize: 15, fontWeight: "700" },
});