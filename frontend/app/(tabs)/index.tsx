import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { MapPin, List, Zap, ShoppingBag, Wrench } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function HomeScreen() {
  const router = useRouter();
  const { location, refreshLocation } = useAuth();
  const { colors, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState<any[]>([]);
  const [mapStations, setMapStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchData();
  }, [location]);

  const fetchData = async () => {
    try {
      const mapData = await api.getMapHome();
      setMapStations(mapData);

      // Pass map data to WebView
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({ type: "UPDATE_STATIONS", data: mapData }),
        );
      }

      if (location) {
        // OPTIMIZATION: Update map immediately before fetching fresh data
        if (webViewRef.current) {
          webViewRef.current.postMessage(
            JSON.stringify({
              type: "CENTER_MAP",
              lat: location.latitude,
              lng: location.longitude,
            }),
          );
          webViewRef.current.postMessage(
            JSON.stringify({
              type: "UPDATE_USER_LOCATION",
              lat: location.latitude,
              lng: location.longitude,
            }),
          );
        }

        const nearbyData = await api.getNearbyPlaces(
          location.latitude,
          location.longitude,
        );
        setStations(nearbyData);
        // Map messages moved up
      } else {
        // Remove user location marker if location is null
        if (webViewRef.current) {
          webViewRef.current.postMessage(
            JSON.stringify({ type: "REMOVE_USER_LOCATION" }),
          );
        }

        // Fallback if no location, just list some stations or keep empty?
        // Maybe fetch generic list or use mapData
        const allStations = await api.getNearbyPlaces(37.77, -122.41); // Default SF
        setStations(allStations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // HTML Content for Leaflet Map
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <style>
      body { 
        margin: 0; 
        padding: 0; 
        overflow: hidden;
      }

      #map { 
        width: 100%; 
        height: 100vh; 
      }

      /* Move zoom controls down and away from edges */
      .leaflet-top.leaflet-left {
        top: 390px;
        left: 14px;
      }

      .leaflet-control-zoom {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      }

      .leaflet-control-zoom a {
        width: 38px;
        height: 3px;
        line-height: 38px;
        font-size: 20px;
      }
    </style>
    </head>

    <body>
    <div id="map"></div>

    <script>
      const map = L.map('map', {
        zoomControl: false
      }).setView([${location?.latitude || 37.77}, ${
        location?.longitude || -122.41
      }], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      /* Re-add zoom control in correct place */
      L.control.zoom({
        position: 'topleft'
      }).addTo(map);

      let markers = [];
      let userMarker;

      const stationIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const showroomIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const serviceIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const userIcon = L.divIcon({
          className: 'user-marker',
          html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
      });

      function updateStations(stations) {
        markers.forEach(m => map.removeLayer(m));
        markers = [];

        stations.forEach(station => {
          let icon = stationIcon;
          if (station.place_type === 'SHOWROOM') icon = showroomIcon;
          if (station.place_type === 'SERVICE') icon = serviceIcon;
          
          const marker = L.marker([station.latitude, station.longitude], { icon: icon })
            .addTo(map)
            .on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'MARKER_CLICK', 
                id: station.id,
                place_type: station.place_type,
                entity_type: station.type
              }));
            });

          markers.push(marker);
        });
      }

      function updateUserLocation(lat, lng) {
          if (userMarker) {
              userMarker.setLatLng([lat, lng]);
          } else {
              userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
          }
      }

      document.addEventListener('message', e => handleData(e.data));
      window.addEventListener('message', e => handleData(e.data));

      function handleData(dataString) {
        try {
          const data = JSON.parse(dataString);

          if (data.type === 'UPDATE_STATIONS') {
            updateStations(data.data);
          }

          if (data.type === 'CENTER_MAP') {
            map.setView([data.lat, data.lng], 13);
          }

          if (data.type === 'UPDATE_USER_LOCATION') {
              updateUserLocation(data.lat, data.lng);
          }

          if (data.type === 'REMOVE_USER_LOCATION') {
              if (userMarker) {
                  map.removeLayer(userMarker);
                  userMarker = null;
              }
          }
        } catch(e) {}
      }
    </script>
    </body>
    </html>
`;

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "MARKER_CLICK") {
        if (data.place_type === "SHOWROOM") {
          router.push({
            pathname: "/showroom-details",
            params: { id: data.id },
          });
        } else if (data.place_type === "SERVICE") {
          router.push({
            pathname: "/service-station-details",
            params: { id: data.id },
          });
        } else {
          router.push({
            pathname: "/details",
            params: {
              id: data.id,
              type: data.entity_type || "station",
            },
          });
        }
      }
    } catch (e) {}
  };

  const onLoadEnd = () => {
    // Send initial data if available
    if (mapStations.length > 0 && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: "UPDATE_STATIONS", data: mapStations }),
      );
    }
    if (location && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "UPDATE_USER_LOCATION",
          lat: location.latitude,
          lng: location.longitude,
        }),
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={{ flex: 1 }}
          onMessage={onMessage}
          onLoadEnd={onLoadEnd}
        />

        <TouchableOpacity
          style={[
            styles.locationButton,
            { top: 380 + insets.top, backgroundColor: colors.card },
          ]}
          onPress={async () => {
            const loc = await refreshLocation();
            if (loc && webViewRef.current) {
              webViewRef.current.postMessage(
                JSON.stringify({
                  type: "CENTER_MAP",
                  lat: loc.latitude,
                  lng: loc.longitude,
                }),
              );
              // Also update user marker
              webViewRef.current.postMessage(
                JSON.stringify({
                  type: "UPDATE_USER_LOCATION",
                  lat: loc.latitude,
                  lng: loc.longitude,
                }),
              );
            }
          }}
        >
          <MapPin size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.listButton, { backgroundColor: colors.card }]}
          onPress={() => router.push("/listing")}
        >
          <List size={20} color={colors.text} strokeWidth={2} />
          <Text style={[styles.listButtonText, { color: colors.text }]}>
            List View
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.bottomSheet,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.bottomSheetHeader}>
          <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>
            Nearby Stations
          </Text>
          <Text style={[styles.stationCount, { color: colors.textSecondary }]}>
            {stations.length} found
          </Text>
        </View>

        <ScrollView
          style={styles.stationList}
          showsVerticalScrollIndicator={false}
        >
          {stations.map((station, idx) => (
            <TouchableOpacity
              key={`${station.type}-${station.id}-${idx}`}
              style={[
                styles.stationCard,
                { backgroundColor: theme === "dark" ? "#374151" : "#f9fafb" },
              ]}
              onPress={() =>
                router.push({
                  pathname:
                    station.place_type === "SHOWROOM"
                      ? "/showroom-details"
                      : station.place_type === "SERVICE"
                        ? "/service-station-details"
                        : "/details",
                  params: {
                    id: station.id,
                    type: station.type || "station",
                  },
                })
              }
            >
              <View
                style={[
                  styles.stationIcon,
                  { backgroundColor: theme === "dark" ? "#1f2937" : "#ecfdf5" },
                ]}
              >
                {station.place_type === "SHOWROOM" ? (
                  <ShoppingBag size={24} color="#3b82f6" strokeWidth={2} />
                ) : station.place_type === "SERVICE" ? (
                  <Wrench size={24} color="#f59e0b" strokeWidth={2} />
                ) : (
                  <Zap size={24} color="#10b981" strokeWidth={2} />
                )}
              </View>
              <View style={styles.stationInfo}>
                <Text style={[styles.stationName, { color: colors.text }]}>
                  {station.name}
                </Text>
                <Text
                  style={[
                    styles.stationOperator,
                    station.place_type === "SHOWROOM" && { color: "#3b82f6" },
                    station.place_type === "SERVICE" && { color: "#f59e0b" },
                  ]}
                >
                  {station.operator}
                </Text>
                <Text
                  style={[
                    styles.stationAddress,
                    { color: colors.textSecondary },
                  ]}
                >
                  {station.distance
                    ? station.distance.toFixed(1) + " km"
                    : "N/A"}{" "}
                  • {station.status}
                </Text>
              </View>
              <View style={styles.stationMeta}>
                <View
                  style={[
                    styles.availableBadge,
                    // Keep light background for badges for contrast, or adjust
                    {
                      backgroundColor: theme === "dark" ? "#1f2937" : "#ecfdf5",
                    },
                    station.status !== "ACTIVE" && {
                      backgroundColor: "#fee2e2",
                    },
                    station.place_type === "SHOWROOM" && {
                      backgroundColor: "#eff6ff",
                    },
                    station.place_type === "SERVICE" && {
                      backgroundColor: "#fffbeb",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.availableBadgeText,
                      station.status !== "ACTIVE" && { color: "#ef4444" },
                      station.place_type === "SHOWROOM" && { color: "#3b82f6" },
                      station.place_type === "SERVICE" && { color: "#f59e0b" },
                    ]}
                  >
                    {station.status === "ACTIVE" ? "Available" : "Busy"}
                  </Text>
                </View>
                <Text
                  style={[styles.stationPrice, { color: colors.textSecondary }]}
                >
                  {station.place_type === "SHOWROOM"
                    ? "Showroom"
                    : station.place_type === "SERVICE"
                      ? "Service Center"
                      : station.price}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  locationButton: {
    position: "absolute",
    right: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,

    elevation: 4,
  },
  listButtonText: {
    fontSize: 14,
  },
  bottomSheet: {
    borderTopWidth: 1,
    padding: 16,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stationCount: {
    fontSize: 14,
  },
  stationList: {
    maxHeight: 192,
  },
  stationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  stationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  stationOperator: {
    fontSize: 14,
    fontWeight: "500",
    color: "#059669",
    marginBottom: 2,
  },
  stationAddress: {
    fontSize: 14,
  },
  stationMeta: {
    alignItems: "flex-end",
  },
  availableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  availableBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10b981",
  },
  stationPrice: {
    fontSize: 12,
  },
});
