import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapFromMessage({ lat, lng, address }) {
  if (lat == null || lng == null) return null;

  return (
    <div className="notif-map">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: "180px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]}>
          <Popup>{address}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
