import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng);
    }
  });
  return null;
}

export default function LocationPicker({ lat, lng, onChange }) {
  return (
    <MapContainer
      center={[lat || 14.5995, lng || 120.9842]}
      zoom={13}
      style={{ height: "250px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler onChange={onChange} />
      {lat && lng && <Marker position={[lat, lng]} />}
    </MapContainer>
  );
}
