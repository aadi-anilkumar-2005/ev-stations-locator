import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Map, Bell } from 'lucide-react-native';

export default function PermissionsScreen() {
  const router = useRouter();
  const { setLocation } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800',
          }}
          style={styles.image}
        />
        <Text style={styles.title}>Enable Location Services</Text>
        <Text style={styles.description}>
          We need your location to show nearby charging stations and provide
          accurate directions
        </Text>

        <View style={styles.features}>
          <View style={styles.featureCard}>
            <MapPin size={24} color="#10b981" strokeWidth={2} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Find Nearby Stations</Text>
              <Text style={styles.featureDescription}>
                Discover charging stations closest to you
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Map size={24} color="#10b981" strokeWidth={2} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Get Directions</Text>
              <Text style={styles.featureDescription}>
                Navigate to stations with turn-by-turn directions
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Bell size={24} color="#10b981" strokeWidth={2} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Real-time Updates</Text>
              <Text style={styles.featureDescription}>
                Get notified about station availability
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={async () => {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
              }

              const location = await Location.getCurrentPositionAsync({});
              const { latitude, longitude } = location.coords;

              // Update Context
              setLocation({ latitude, longitude });

              // Update Backend
              await api.updateLocation(latitude, longitude);

              router.replace('/(tabs)');
            } catch (error) {
              console.error(error);
              alert('Error getting location. Please try again.');
            }
          }}>
          <Text style={styles.primaryButtonText}>Allow Location Access</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.secondaryButtonText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  image: {
    width: '100%',
    height: 192,
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  features: {
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  buttonContainer: {
    padding: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
