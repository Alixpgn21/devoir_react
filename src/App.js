import React, { useState, useEffect } from "react";
import "./styles.css";

function App() {
  const [saisie, setSaisie] = useState("");
  const [meteo, setMeteo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [isNuit, setIsNuit] = useState(false);

  // Vérification de l'heure pour le mode sombre
  useEffect(function () {
    const date = new Date();
    const h = date.getHours();
    if (h >= 20 || h <= 9) {
      setIsNuit(true);
    }
  }, []);

  // Géolocalisation
  useEffect(function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(
          "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
            lat +
            "&lon=" +
            lon
        )
          .then(function (res) {
            return res.json();
          })
          .then(function (json) {
            const villeDetectee =
              json.address.city || json.address.town || json.address.village;
            if (villeDetectee) {
              lancerRecherche(villeDetectee);
            }
          });
      });
    }
  }, []);

  function lancerRecherche(nom) {
    if (nom === "") return;
    setLoading(true);
    setErreur("");

    fetch("https://dummyjson.com/users/1")
      .then(function (res) {
        return res.json();
      })
      .then(function () {
        const etats = ["Ensoleillé", "Pluvieux", "Nuageux"];
        const cielChoisi = etats[Math.floor(Math.random() * etats.length)];
        const dataMeteo = {
          ville: nom,
          temperature: Math.floor(Math.random() * 35),
          etat: cielChoisi,
        };
        setMeteo(dataMeteo);
        localStorage.setItem("tp_meteo_save", JSON.stringify(dataMeteo));
        setLoading(false);
      })
      .catch(function () {
        setLoading(false);
        const sauvegarde = localStorage.getItem("tp_meteo_save");
        if (sauvegarde) {
          setMeteo(JSON.parse(sauvegarde));
          setErreur("Mode hors-ligne");
        }
      });
  }

  function getEmoji(etat) {
    if (etat === "Ensoleillé") return "☀️";
    if (etat === "Pluvieux") return "🌧️";
    if (etat === "Nuageux") return "☁️";
    else {
      return "";
    }
  }

  let conseilHabits = "";
  if (meteo && meteo.etat === "Pluvieux") {
    conseilHabits = "Prenez un parapluie avant de partir !";
  } else if (meteo && meteo.etat === "Ensoleillé") {
    if (meteo.temperature > 25) {
      conseilHabits = "Attention aux coups de soleil !";
    } else {
      conseilHabits = "Une tenue plutôt légère aujourd'huit.";
    }
  } else if (meteo && meteo.etat === "Nuageux") {
    if (meteo.temperature < 15) {
      conseilHabits = "Mettez un manteau, il fait froid.";
    } else {
      conseilHabits = "Un petit pull pour aujourd'hui.";
    }
  }

  return (
    <div className={isNuit ? "app-container sombre" : "app-container"}>
      <div className="carte">
        <input
          className="recherche"
          type="text"
          placeholder="Rechercher"
          value={saisie}
          onChange={function (e) {
            setSaisie(e.target.value);
          }}
          onKeyDown={function (e) {
            if (e.key === "Enter") lancerRecherche(saisie);
          }}
        />

        {loading && <p>Un instant, je cherche la météo...</p>}
        {erreur && <p className="alerte">{erreur}</p>}

        {meteo && !loading && (
          <div>
            <div className="label-ville">{meteo.ville} • FRANCE</div>
            <div className="temp-zone">
              <div>
                <h1 className="degres">{meteo.temperature}°C</h1>
                <p>{meteo.etat}</p>
              </div>
              <div className="emoji-meteo">{getEmoji(meteo.etat)}</div>
            </div>
            <div className="habits">{conseilHabits}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
