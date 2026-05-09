from django.test import TestCase
from rest_framework.test import APIClient
from .models import Place, PlaceCharger, Operator, ChargerType, Amenity

class PlaceFilterTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.op = Operator.objects.create(name="TestOp")
        self.wifi = Amenity.objects.create(name="WiFi")
        
        # Create Charger Types
        self.type_ac = ChargerType.objects.create(name="AC", connector_type="Type 2", max_power_kw=22)
        self.type_dc = ChargerType.objects.create(name="DC", connector_type="CCS2", max_power_kw=50)

        # Create Places
        self.place_ac = Place.objects.create(
            name="AC Place", 
            place_type=Place.PlaceType.CHARGING,
            # average_rating=0, # Optional if present in model, otherwise ignore
            latitude=1.0, longitude=1.0, 
            operator=self.op,
            address="123 AC St"
        )
        self.place_ac.amenities.add(self.wifi)
        # Link AC charger
        PlaceCharger.objects.create(
            place=self.place_ac, 
            charger_type=self.type_ac, 
            start_price=0.20, end_price=0.20, 
            is_available=True
        )

        self.place_dc = Place.objects.create(
            name="DC Place", 
            place_type=Place.PlaceType.CHARGING,
            latitude=1.1, longitude=1.1, 
            operator=self.op,
            address="456 DC St"
        )
        # Link DC charger (Busy/Offline -> is_available=False for testing count)
        PlaceCharger.objects.create(
            place=self.place_dc, 
            charger_type=self.type_dc, 
            start_price=0.30, end_price=0.30, 
            is_available=False
        )

    def test_filter_ac(self):
        # API looks for fuzzy match 'ac', so "AC" name should match
        response = self.client.get('/api/places/filter/', {'charger_type': 'ac'})
        self.assertEqual(response.status_code, 200)
        # Should find place_ac
        ids = [p['id'] for p in response.data]
        self.assertIn(self.place_ac.id, ids)
        # Should NOT find place_dc (it has DC type)
        self.assertNotIn(self.place_dc.id, ids)
        
        # Check available count for the matched place
        # place_ac has 1 available charger
        place_data = next(p for p in response.data if p['id'] == self.place_ac.id)
        self.assertEqual(place_data['available_count'], 1)

    def test_filter_dc(self):
        response = self.client.get('/api/places/filter/', {'charger_type': 'dc'})
        self.assertEqual(response.status_code, 200)
        ids = [p['id'] for p in response.data]
        self.assertIn(self.place_dc.id, ids)
        self.assertNotIn(self.place_ac.id, ids)

        # Check available count
        # place_dc has 1 charger but is_available=False
        place_data = next(p for p in response.data if p['id'] == self.place_dc.id)
        self.assertEqual(place_data['available_count'], 0)
