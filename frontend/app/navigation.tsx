import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { X, Navigation, MapPin } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { calculateDistance } from "@/utils/distance";
import { useTheme } from "@/context/ThemeContext";

export default function NavigationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { location } = useAuth();
  const { colors, theme } = useTheme();
  const webViewRef = useRef<WebView>(null);

  const [routeInfo, setRouteInfo] = useState({
    distance: 0, // in km
    duration: 0, // in seconds
  });
  const [loading, setLoading] = useState(true);

  // Parse params (they come as strings)
  const stationLat = parseFloat(params.lat as string);
  const stationLng = parseFloat(params.lng as string);
  const stationName = params.name as string;
  const stationAddress = params.address as string;

  useEffect(() => {
    if (location && stationLat && stationLng) {
      fetchRoute();
    }
  }, [location]);

  const fetchRoute = async () => {
    if (!location) return;

    try {
      // Use OSRM for routing (free public API)
      const response = await fetch(
        `http://router.project-osrm.org/route/v1/driving/${location.longitude},${location.latitude};${stationLng},${stationLat}?overview=full&geometries=geojson`,
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteInfo({
          distance: route.distance / 1000, // meters to km
          duration: route.duration, // seconds
        });

        // Pass route geometry to WebView
        if (webViewRef.current) {
          webViewRef.current.postMessage(
            JSON.stringify({
              type: "DRAW_ROUTE",
              geometry: route.geometry,
              start: [location.latitude, location.longitude],
              end: [stationLat, stationLng],
            }),
          );
        }
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      // Fallback: Calculate direct distance
      const dist = calculateDistance(
        location?.latitude || 0,
        location?.longitude || 0,
        stationLat,
        stationLng,
      );
      setRouteInfo((prev) => ({ ...prev, distance: dist }));
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return "< 1 min";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hr ${mins} min`;
  };

  const handleStartNavigation = () => {
    if (location && webViewRef.current) {
      // Zoom in and center on user
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "START_NAVIGATION",
          lat: location.latitude,
          lng: location.longitude,
        }),
      );
    }
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      body { margin: 0; padding: 0; overflow: hidden; }
      #map { width: 100%; height: 100vh; }
      .leaflet-control-zoom { display: none; } 
    </style>
    </head>
    <body>
    <div id="map"></div>
    <script>
      const map = L.map('map', { zoomControl: false }).setView([${
        location?.latitude || stationLat
      }, ${location?.longitude || stationLng}], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Icons
      const userIcon = L.divIcon({
          className: 'user-marker',
          html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
      });

      const stationIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      let userMarker = null;
      let routeLayer = null;
      let stationMarker = L.marker([${stationLat}, ${stationLng}], { icon: stationIcon }).addTo(map);

      function updateUserLocation(lat, lng) {
        if (userMarker) {
          userMarker.setLatLng([lat, lng]);
        } else {
          userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        }
      }

      function drawRoute(geometry, start, end) {
        if (routeLayer) map.removeLayer(routeLayer);
        
        // geometry is GeoJSON
        routeLayer = L.geoJSON(geometry, {
          style: { color: '#3b82f6', weight: 5, opacity: 0.7 }
        }).addTo(map);

        // Only fit bounds if we haven't started navigation (zoomed in manually or via button)
        // For now, initially fit bounds
         map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
      }

      document.addEventListener('message', e => handleData(e.data));
      window.addEventListener('message', e => handleData(e.data));

      function handleData(dataString) {
        try {
          const data = JSON.parse(dataString);
          if (data.type === 'UPDATE_USER_LOCATION') {
            updateUserLocation(data.lat, data.lng);
          }
          if (data.type === 'DRAW_ROUTE') {
            drawRoute(data.geometry, data.start, data.end);
          }
          if (data.type === 'START_NAVIGATION') {
            map.setView([data.lat, data.lng], 18, { animate: true });
          }
        } catch(e) {}
      }
    </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mapContainer}>
        {location ? (
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            style={{ flex: 1 }}
            onLoadEnd={() => {
              if (location && webViewRef.current) {
                webViewRef.current.postMessage(
                  JSON.stringify({
                    type: "UPDATE_USER_LOCATION",
                    lat: location.latitude,
                    lng: location.longitude,
                  }),
                );
                // Trigger route fetch again if needed/late load
                fetchRoute();
              }
            }}
          />
        ) : (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6" },
            ]}
          >
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={{ marginTop: 10, color: colors.text }}>
              Locating...
            </Text>
          </View>
        )}

        <View
          style={[
            styles.routeCard,
            { top: 16 + insets.top, backgroundColor: colors.card },
          ]}
        >
          <View style={styles.routeHeader}>
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.routeInfo}>
              <Text
                style={[styles.stationName, { color: colors.text }]}
                numberOfLines={1}
              >
                {stationName || "Unknown Station"}
              </Text>
              <Text
                style={[styles.stationAddress, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {stationAddress || "No address provided"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.routeStats,
              { backgroundColor: theme === "dark" ? "#064e3b" : "#ecfdf5" },
            ]}
          >
            <View style={styles.routeStat}>
              <Text style={styles.routeStatValue}>
                {routeInfo.distance.toFixed(1)} km
              </Text>
              <Text
                style={[styles.routeStatLabel, { color: colors.textSecondary }]}
              >
                Distance
              </Text>
            </View>
            <View style={styles.routeStat}>
              <Text style={styles.routeStatValue}>
                {formatDuration(routeInfo.duration)}
              </Text>
              <Text
                style={[styles.routeStatLabel, { color: colors.textSecondary }]}
              >
                ETA
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.actions,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartNavigation}
        >
          <Navigation size={24} color="#fff" strokeWidth={2} />
          <Text style={styles.startButtonText}>Start Navigation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  routeCard: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  stationAddress: {
    fontSize: 14,
  },
  routeStats: {
    flexDirection: "row",
    gap: 16,
    padding: 12,
    borderRadius: 12,
  },
  routeStat: {
    flex: 1,
  },
  routeStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10b981",
    marginBottom: 2,
  },
  routeStatLabel: {
    fontSize: 14,
  },
  actions: {
    borderTopWidth: 1,
    padding: 24,
    gap: 12,
  },
  startButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
