# Google Maps API Setup Guide

## 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (required)
   - **Places API** (optional, for advanced features)
   - **Geocoding API** (optional, for address lookup)

4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

## 2. Environment Configuration

Create a `.env` file in the root directory with:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## 3. Features Included

### Interactive Map Component
- **Click to Set Location**: Click anywhere on the map to set coordinates
- **Drag Marker**: Drag the blue marker to adjust location
- **Real-time Updates**: Coordinates update automatically in the form
- **Custom Styling**: Clean, professional map appearance
- **Plot Information**: Shows plot number overlay on the map
- **Loading State**: Smooth loading animation while map initializes

### Map Features
- **Custom Map Styles**: Professional color scheme
- **Responsive Design**: Works on all screen sizes
- **Error Handling**: Graceful fallback if API key is missing
- **Performance Optimized**: Efficient rendering and updates

## 4. Usage

The map is automatically integrated into the Create Contract page in the Location section. Users can:

1. **View Current Location**: Map shows the current latitude/longitude
2. **Update Location**: Click or drag to change coordinates
3. **See Plot Info**: Plot number is displayed as an overlay
4. **Real-time Sync**: Form fields update automatically

## 5. Security Notes

- Never commit your actual API key to version control
- Use environment variables for API keys
- Restrict your API key to specific domains/IPs in Google Cloud Console
- Monitor API usage to avoid unexpected charges

## 6. Troubleshooting

### Map Not Loading
- Check if API key is correctly set in `.env` file
- Verify that Maps JavaScript API is enabled
- Check browser console for error messages

### API Key Issues
- Ensure API key has proper permissions
- Check if API key is restricted to correct domain
- Verify billing is enabled in Google Cloud Console

### Performance Issues
- Map loads asynchronously to avoid blocking the page
- Loading indicator shows while map initializes
- Efficient re-rendering when coordinates change
