// Cuentacuentos v2 — Nerea, Darío, Tiago
import { useState, useEffect, useRef } from "react";

// ==================== DATOS ====================
// mode: "child" = 6-8 años, "baby" = 2-5 años, null = elegir
const PROFILES = [
  { id: 1, name: "Nerea", avatar: "👧", color: "#FF6B9D", bgColor: "#FFE4F0", mode: "child" },
  { id: 2, name: "Darío", avatar: "👦", color: "#4ECDC4", bgColor: "#E0F7F5", mode: "baby" },
  { id: 3, name: "Tiago", avatar: "🧒", color: "#FFB347", bgColor: "#FFF3E0", mode: "baby" },
];

const CATEGORIES = [
  { id: "cartoons", label: "Dibujos Animados", emoji: "📺", color: "#FF6B9D" },
  { id: "disney", label: "Disney", emoji: "🏰", color: "#9B59B6" },
  { id: "superheroes", label: "Superhéroes", emoji: "🦸", color: "#E74C3C" },
  { id: "paw", label: "Patrulla Canina", emoji: "🐾", color: "#3498DB" },
  { id: "sports", label: "Deportes", emoji: "⚽", color: "#2ECC71" },
  { id: "travel", label: "Viajes", emoji: "✈️", color: "#F39C12" },
];

const CHARACTERS = {
  cartoons: [
    { id: "peppa", name: "Peppa Pig", emoji: "🐷" },
    { id: "bluey", name: "Bluey", emoji: "🐕" },
    { id: "bob", name: "Bob Esponja", emoji: "🧽" },
    { id: "tom", name: "Tom y Jerry", emoji: "🐱" },
  ],
  disney: [
    { id: "elsa", name: "Elsa", emoji: "❄️" },
    { id: "simba", name: "Simba", emoji: "🦁" },
    { id: "moana", name: "Moana", emoji: "🌊" },
    { id: "buzz", name: "Buzz Lightyear", emoji: "🚀" },
  ],
  superheroes: [
    { id: "spidey", name: "Spider-Man", emoji: "🕷️" },
    { id: "batman", name: "Batman", emoji: "🦇" },
    { id: "wonder", name: "Wonder Woman", emoji: "⭐" },
    { id: "super", name: "Superman", emoji: "🦸" },
  ],
  paw: [
    { id: "chase", name: "Chase", emoji: "🐾" },
    { id: "marshall", name: "Marshall", emoji: "🚒" },
    { id: "skye", name: "Skye", emoji: "🚁" },
    { id: "rubble", name: "Rubble", emoji: "🏗️" },
  ],
  sports: [
    { id: "futbol", name: "Fútbol", emoji: "⚽" },
    { id: "basket", name: "Baloncesto", emoji: "🏀" },
    { id: "natacion", name: "Natación", emoji: "🏊" },
    { id: "tenis", name: "Tenis", emoji: "🎾" },
  ],
  travel: [
    { id: "space", name: "El Espacio", emoji: "🚀" },
    { id: "jungle", name: "La Selva", emoji: "🌿" },
    { id: "ocean", name: "El Océano", emoji: "🌊" },
    { id: "mountains", name: "Las Montañas", emoji: "⛰️" },
  ],
};

// ==================== API ====================
async function generateStory(character, category, playerName, mode, choiceContext = "") {
  const modeInstructions = mode === "baby"
    ? `Escribe para niños de 2-5 años. Usa frases MUY cortas (máximo 8 palabras). Vocabulario simplísimo. Muchas onomatopeyas. Texto alegre. Máximo 3 párrafos cortos.`
    : `Escribe para niños de 6-8 años. Frases cortas con algo más de detalle. Máximo 4 párrafos. Vocabulario sencillo pero rico.`;

  const prompt = choiceContext
    ? `Continúa el cuento de ${character.name} para ${playerName}. Categoría: ${category.label}. ${modeInstructions}
    El niño eligió: "${choiceContext}"
    Continúa la historia. Al final incluye una pregunta con exactamente 3 opciones.
    RESPONDE SOLO EN JSON sin texto adicional:
    {"paragraphs":["p1","p2","p3"],"question":"¿Qué hace ${playerName} ahora?","choices":[{"emoji":"🌟","text":"Opción 1"},{"emoji":"🌈","text":"Opción 2"},{"emoji":"⭐","text":"Opción 3"}]}`
    : `Crea el INICIO de un cuento para ${playerName} protagonizado por ${character.name} (${character.emoji}) en categoría ${category.label}. ${modeInstructions}
    Incluye a ${playerName} como amigo del protagonista. Al final incluye una pregunta con exactamente 3 opciones.
    RESPONDE SOLO EN JSON sin texto adicional:
    {"title":"Título del cuento","paragraphs":["p1","p2","p3"],"question":"¿Qué hace ${playerName} ahora?","choices":[{"emoji":"🌟","text":"Opción 1"},{"emoji":"🌈","text":"Opción 2"},{"emoji":"⭐","text":"Opción 3"}]}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  const text = data.content.map(i => i.text || "").join("");
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return {
      title: "Un cuento mágico",
      paragraphs: ["Había una vez una gran aventura...", "Y fue muy divertida.", "¿Qué pasará después?"],
      question: "¿Qué hacemos ahora?",
      choices: [{ emoji: "🌟", text: "Ir al bosque" }, { emoji: "🏠", text: "Volver a casa" }, { emoji: "🎉", text: "Hacer una fiesta" }],
    };
  }
}

// ==================== SHARED COMPONENTS ====================
function StarsBg() {
  const stars = useRef([...Array(20)].map(() => ({
    left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    size: Math.random() * 20 + 8, dur: Math.random() * 3 + 2, delay: Math.random() * 3,
  }))).current;
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: s.left, top: s.top, fontSize: s.size, opacity: 0.15, animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }}>⭐</div>
      ))}
    </div>
  );
}

function BigButton({ children, onClick, color = "#FF6B9D", emoji, disabled, small }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)} onTouchStart={() => setPressed(true)} onTouchEnd={() => setPressed(false)}
      style={{
        background: disabled ? "#ccc" : `linear-gradient(145deg, ${color}, ${color}dd)`,
        border: "none", borderRadius: small ? 16 : 24,
        padding: small ? "10px 18px" : "16px 28px",
        fontSize: small ? 16 : 20, fontFamily: "'Fredoka One', cursive", color: "white",
        cursor: disabled ? "default" : "pointer",
        boxShadow: pressed ? `0 2px 0 ${color}88` : `0 6px 0 ${color}88, 0 8px 20px ${color}44`,
        transform: pressed ? "translateY(4px)" : "translateY(0)", transition: "all 0.1s ease",
        display: "flex", alignItems: "center", gap: 10, userSelect: "none",
        touchAction: "manipulation", width: "100%", justifyContent: "center",
      }}>
      {emoji && <span style={{ fontSize: small ? 20 : 28 }}>{emoji}</span>}
      {children}
    </button>
  );
}

// ==================== SCREEN: SELECT PROFILE ====================
function SelectProfileScreen({ onSelect }) {
  const [customName, setCustomName] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customMode, setCustomMode] = useState(null);

  const handleCustomSubmit = () => {
    if (customName.trim() && customMode) {
      onSelect({ id: 99, name: customName.trim(), avatar: "🧒", color: "#A78BFA", bgColor: "#EDE9FE", mode: customMode });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <StarsBg />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 72, marginBottom: 8, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>📖</div>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 36, color: "white", margin: 0, textShadow: "0 3px 12px rgba(0,0,0,0.3)", lineHeight: 1.1 }}>
            Cuentacuentos ✨
          </h1>
          <p style={{ fontFamily: "'Nunito', sans-serif", color: "rgba(255,255,255,0.9)", fontSize: 18, margin: "8px 0 0" }}>
            ¿Quién va a leer hoy? 🌟
          </p>
        </div>

        {/* Perfiles predefinidos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 13 }}>
          {PROFILES.map(profile => (
            <button key={profile.id} onClick={() => onSelect(profile)}
              style={{ background: "rgba(255,255,255,0.95)", border: "none", borderRadius: 28, padding: "15px 20px", display: "flex", alignItems: "center", gap: 15, cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)"; }}
            >
              <div style={{ width: 58, height: 58, borderRadius: "50%", background: profile.bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, border: `3px solid ${profile.color}`, flexShrink: 0 }}>
                {profile.avatar}
              </div>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontSize: 22, color: "#333", fontFamily: "'Fredoka One', cursive" }}>{profile.name}</div>
                <div style={{ fontSize: 13, color: "#888", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                  {profile.mode === "child" ? "📚 Modo Niño · 6-8 años" : "🌟 Modo Bebé · 2-5 años"}
                </div>
              </div>
              <div style={{ fontSize: 26 }}>▶️</div>
            </button>
          ))}
        </div>

        {/* Botón Otro niño */}
        {!showCustom ? (
          <button onClick={() => setShowCustom(true)}
            style={{ width: "100%", background: "rgba(255,255,255,0.18)", border: "3px dashed rgba(255,255,255,0.6)", borderRadius: 28, padding: "15px 20px", display: "flex", alignItems: "center", gap: 15, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
          >
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, border: "3px dashed rgba(255,255,255,0.6)", flexShrink: 0 }}>
              ➕
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 20, color: "white", fontFamily: "'Fredoka One', cursive" }}>Otro niño</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>¡Escribe tu nombre! ✏️</div>
            </div>
          </button>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: 28, padding: "20px 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", animation: "fadeSlide 0.3s ease" }}>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: "#333", margin: "0 0 11px", textAlign: "center" }}>¿Cómo te llamas? ✏️</p>
            <input
              type="text" value={customName} onChange={e => setCustomName(e.target.value)}
              placeholder="Escribe tu nombre..." maxLength={20}
              onKeyDown={e => e.key === "Enter" && handleCustomSubmit()}
              style={{ width: "100%", border: "3px solid #A78BFA", borderRadius: 16, padding: "11px 15px", fontSize: 20, fontFamily: "'Fredoka One', cursive", color: "#333", outline: "none", boxSizing: "border-box", marginBottom: 13 }}
            />
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: "#555", margin: "0 0 9px", textAlign: "center" }}>¿Qué modo quieres?</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 13 }}>
              <button onClick={() => setCustomMode("child")}
                style={{ flex: 1, background: customMode === "child" ? "#FF6B9D" : "#FFE4F0", border: "3px solid #FF6B9D", borderRadius: 18, padding: "11px 6px", cursor: "pointer", fontFamily: "'Fredoka One', cursive", fontSize: 15, color: customMode === "child" ? "white" : "#FF6B9D", transition: "all 0.15s" }}>
                📚 Niño
              </button>
              <button onClick={() => setCustomMode("baby")}
                style={{ flex: 1, background: customMode === "baby" ? "#4ECDC4" : "#E0F7F5", border: "3px solid #4ECDC4", borderRadius: 18, padding: "11px 6px", cursor: "pointer", fontFamily: "'Fredoka One', cursive", fontSize: 15, color: customMode === "baby" ? "white" : "#4ECDC4", transition: "all 0.15s" }}>
                🌟 Bebé
              </button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowCustom(false); setCustomName(""); setCustomMode(null); }}
                style={{ flex: 1, background: "#eee", border: "none", borderRadius: 16, padding: "11px", cursor: "pointer", fontFamily: "'Fredoka One', cursive", fontSize: 15, color: "#888" }}>
                ⬅️ Volver
              </button>
              <button onClick={handleCustomSubmit} disabled={!customName.trim() || !customMode}
                style={{ flex: 2, background: customName.trim() && customMode ? "#A78BFA" : "#ddd", border: "none", borderRadius: 16, padding: "11px", cursor: customName.trim() && customMode ? "pointer" : "default", fontFamily: "'Fredoka One', cursive", fontSize: 16, color: "white", boxShadow: customName.trim() && customMode ? "0 4px 0 #7c5cbf" : "none", transition: "all 0.15s" }}>
                ¡Empezar! 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== SCREEN: SELECT MODE (solo perfil custom) ====================
function SelectModeScreen({ profile, onSelect, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #A78BFA33 0%, #A78BFA11 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <StarsBg />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 72 }}>{profile.avatar}</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 30, color: "#333", margin: "8px 0 4px" }}>¡Hola, {profile.name}! 🎉</h2>
          <p style={{ fontFamily: "'Nunito', sans-serif", color: "#666", fontSize: 16, margin: 0 }}>¿Cómo quieres tu cuento?</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button onClick={() => onSelect("child")}
            style={{ background: "linear-gradient(135deg, #FF6B9D, #ff8fb3)", border: "none", borderRadius: 28, padding: "24px 28px", cursor: "pointer", boxShadow: "0 8px 0 #cc4477, 0 10px 30px #FF6B9D44", transition: "all 0.1s", textAlign: "left" }}
            onMouseDown={e => e.currentTarget.style.transform = "translateY(4px)"}
            onMouseUp={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: 48, marginBottom: 4 }}>📚</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 26, color: "white" }}>Modo Niño</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Para 6-8 años · Leer y elegir 📖</div>
          </button>
          <button onClick={() => onSelect("baby")}
            style={{ background: "linear-gradient(135deg, #4ECDC4, #7eddd7)", border: "none", borderRadius: 28, padding: "24px 28px", cursor: "pointer", boxShadow: "0 8px 0 #2aa39b, 0 10px 30px #4ECDC444", transition: "all 0.1s", textAlign: "left" }}
            onMouseDown={e => e.currentTarget.style.transform = "translateY(4px)"}
            onMouseUp={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: 48, marginBottom: 4 }}>🌟</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 26, color: "white" }}>Modo Bebé</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Para 2-5 años · Iconos y voz 🔊</div>
          </button>
        </div>
        <div style={{ marginTop: 20 }}>
          <BigButton onClick={onBack} color="#aaa" emoji="⬅️" small>Volver</BigButton>
        </div>
      </div>
    </div>
  );
}

// ==================== SCREEN: SELECT CATEGORY ====================
function SelectCategoryScreen({ profile, onSelect, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FFF9F0 0%, #FFE4B5 100%)", padding: "24px 20px", position: "relative" }}>
      <StarsBg />
      <div style={{ maxWidth: 440, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ fontSize: 52 }}>{profile.avatar}</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 27, color: "#333", margin: "8px 0 4px" }}>¡Hola {profile.name}! 🎭</h2>
          <p style={{ fontFamily: "'Nunito', sans-serif", color: "#888", fontSize: 15, margin: 0 }}>¿Qué tipo de cuento quieres?</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 18 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => onSelect(cat)}
              style={{ background: "white", border: `3px solid ${cat.color}`, borderRadius: 24, padding: "20px 12px", cursor: "pointer", boxShadow: `0 6px 0 ${cat.color}66`, transition: "all 0.1s", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
              onMouseDown={e => { e.currentTarget.style.transform = "translateY(3px)"; e.currentTarget.style.boxShadow = `0 3px 0 ${cat.color}66`; }}
              onMouseUp={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 6px 0 ${cat.color}66`; }}
            >
              <div style={{ fontSize: 44 }}>{cat.emoji}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: "#333", textAlign: "center", lineHeight: 1.2 }}>{cat.label}</div>
            </button>
          ))}
        </div>
        <BigButton onClick={onBack} color="#aaa" emoji="⬅️" small>Volver</BigButton>
      </div>
    </div>
  );
}

// ==================== SCREEN: SELECT CHARACTER ====================
function SelectCharacterScreen({ profile, category, onSelect, onBack }) {
  const chars = CHARACTERS[category.id] || [];
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, #f0f8ff 0%, ${category.color}22 100%)`, padding: "24px 20px", position: "relative" }}>
      <StarsBg />
      <div style={{ maxWidth: 440, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ fontSize: 52 }}>{category.emoji}</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 27, color: "#333", margin: "8px 0 4px" }}>¡Elige tu personaje! ✨</h2>
          <p style={{ fontFamily: "'Nunito', sans-serif", color: "#888", fontSize: 15, margin: 0 }}>¿Quién será el protagonista?</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 18 }}>
          {chars.map(char => (
            <button key={char.id} onClick={() => onSelect(char)}
              style={{ background: "white", border: `3px solid ${category.color}`, borderRadius: 24, padding: "22px 12px", cursor: "pointer", boxShadow: `0 6px 0 ${category.color}66`, transition: "all 0.1s", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
              onMouseDown={e => e.currentTarget.style.transform = "translateY(3px)"}
              onMouseUp={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: 52 }}>{char.emoji}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 17, color: "#333", textAlign: "center" }}>{char.name}</div>
            </button>
          ))}
        </div>
        <BigButton onClick={onBack} color="#aaa" emoji="⬅️" small>Volver</BigButton>
      </div>
    </div>
  );
}

// ==================== SCREEN: STORY CHILD MODE ====================
function StoryChildScreen({ profile, category, character, onRestart }) {
  const [storyData, setStoryData] = useState(null);
  const [title, setTitle] = useState("");
  const [paragraphs, setParagraphs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [chapterCount, setChapterCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const endRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => { loadInitialStory(); return () => timers.current.forEach(clearTimeout); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [paragraphs.length, showChoices, loading, finished]);

  const revealParas = (newParas) => {
    newParas.forEach((text, i) => {
      const t = setTimeout(() => {
        setParagraphs(prev => [...prev, text]);
        if (i === newParas.length - 1) {
          const t2 = setTimeout(() => setShowChoices(true), 600);
          timers.current.push(t2);
        }
      }, i * 900);
      timers.current.push(t);
    });
  };

  const loadInitialStory = async () => {
    setLoading(true);
    const data = await generateStory(character, category, profile.name, "child");
    setTitle(data.title || `El cuento de ${character.name}`);
    setStoryData(data);
    setLoading(false);
    revealParas(data.paragraphs || []);
  };

  const handleChoice = async (choice) => {
    setShowChoices(false);
    if (chapterCount >= 3) {
      setParagraphs(prev => [...prev, `🌟 ¡Y colorín colorado, este cuento ha acabado! ${profile.name} y ${character.name} vivieron felices para siempre. 🎉`]);
      setFinished(true);
      return;
    }
    setLoading(true);
    setChapterCount(c => c + 1);
    const data = await generateStory(character, category, profile.name, "child", choice.text);
    setStoryData(data);
    setLoading(false);
    revealParas(data.paragraphs || []);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FFFDE7 0%, #FFF9C4 100%)", paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${category.color}, ${category.color}cc)`, padding: "20px 20px 28px", borderRadius: "0 0 32px 32px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 440, margin: "0 auto" }}>
          <div style={{ fontSize: 36 }}>{character.emoji}</div>
          <div>
            <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 21, color: "white", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              {title || `El cuento de ${character.name}`}
            </h1>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>
              {profile.avatar} {profile.name} · {category.emoji} {category.label}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "22px 20px" }}>
        {paragraphs.map((para, i) => (
          <div key={i} style={{ background: "white", borderRadius: 20, padding: "15px 20px", marginBottom: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", animation: "fadeSlide 0.5s ease", borderLeft: `4px solid ${category.color}` }}>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 17, lineHeight: 1.7, color: "#333", margin: 0 }}>{para}</p>
          </div>
        ))}

        {loading && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 48, animation: "bounce 0.8s ease infinite" }}>✍️</div>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: "#888" }}>Escribiendo el cuento...</p>
          </div>
        )}

        {showChoices && storyData && !finished && (
          <div style={{ animation: "fadeSlide 0.5s ease", background: `${category.color}22`, borderRadius: 24, padding: "20px", border: `3px solid ${category.color}`, marginTop: 8 }}>
            <div style={{ textAlign: "center", fontSize: 32, marginBottom: 8 }}>🤔</div>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: "#333", textAlign: "center", margin: "0 0 16px" }}>
              {storyData.question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {storyData.choices?.map((choice, i) => (
                <BigButton key={i} onClick={() => handleChoice(choice)} color={["#FF6B9D", "#4ECDC4", "#FFB347"][i]} emoji={choice.emoji}>
                  {choice.text}
                </BigButton>
              ))}
            </div>
          </div>
        )}

        {finished && (
          <div style={{ marginTop: 20, animation: "fadeSlide 0.5s ease", background: "linear-gradient(135deg, #FFD700, #FFA500)", borderRadius: 28, padding: 24, textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize: 52 }}>🏆</div>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "white", margin: "8px 0 16px" }}>¡Cuento terminado!</p>
            <BigButton onClick={onRestart} color="white" emoji="🏠">
              <span style={{ color: "#FF6B9D" }}>Volver al inicio</span>
            </BigButton>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}

// ==================== SCREEN: STORY BABY MODE ====================
function StoryBabyScreen({ profile, category, character, onRestart }) {
  const [storyData, setStoryData] = useState(null);
  const [title, setTitle] = useState("");
  const [paragraphs, setParagraphs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [chapterCount, setChapterCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentSpeakIdx, setCurrentSpeakIdx] = useState(-1);
  const endRef = useRef(null);
  const parasRef = useRef([]);

  useEffect(() => { loadInitialStory(); return () => window.speechSynthesis?.cancel(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [paragraphs.length, showChoices, loading, finished]);

  const speak = (text, idx, onDone) => {
    if (!window.speechSynthesis) { setTimeout(() => onDone?.(), 1000); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES"; u.rate = 0.82; u.pitch = 1.2;
    setSpeaking(true); setCurrentSpeakIdx(idx);
    u.onend = () => { setSpeaking(false); setCurrentSpeakIdx(-1); onDone?.(); };
    u.onerror = () => { setSpeaking(false); setCurrentSpeakIdx(-1); onDone?.(); };
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false); setCurrentSpeakIdx(-1);
  };

  const speakByIdx = (idx) => {
    const p = parasRef.current[idx];
    if (p) speak(p, idx, null);
  };

  // Secuencia: revela y lee uno a uno, al final lee la pregunta y muestra opciones
  const revealSequence = (paras, startIdx, question, onDone) => {
    let i = 0;
    const next = () => {
      if (i >= paras.length) {
        // Lee la pregunta en voz alta
        speak(question || "¿Qué hacemos ahora?", 9000, () => {
          setTimeout(() => { setShowChoices(true); onDone?.(); }, 300);
        });
        return;
      }
      const globalIdx = startIdx + i;
      const text = paras[i];
      parasRef.current = [...parasRef.current, text];
      setParagraphs(prev => [...prev, text]);
      i++;
      speak(text, globalIdx, () => { setTimeout(next, 350); });
    };
    setTimeout(next, 400);
  };

  const loadInitialStory = async () => {
    setLoading(true);
    const data = await generateStory(character, category, profile.name, "baby");
    setTitle(data.title || `El cuento de ${character.name}`);
    setStoryData(data);
    setLoading(false);
    revealSequence(data.paragraphs || [], 0, data.question, null);
  };

  const handleChoice = async (choice) => {
    setShowChoices(false);
    stopSpeaking();
    if (chapterCount >= 3) {
      const endText = `¡Muy bien ${profile.name}! ¡Has terminado el cuento! ¡Bravo!`;
      parasRef.current = [...parasRef.current, `🌟 ${endText}`];
      setParagraphs(prev => [...prev, `🌟 ${endText}`]);
      speak(endText, 9999, null);
      setFinished(true);
      return;
    }
    setLoading(true);
    setChapterCount(c => c + 1);
    const data = await generateStory(character, category, profile.name, "baby", choice.text);
    setStoryData(data);
    const currentLen = parasRef.current.length;
    setLoading(false);
    revealSequence(data.paragraphs || [], currentLen, data.question, null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #E8F4FD 0%, #B8E0FF 100%)", paddingBottom: 120 }}>
      <div style={{ background: "linear-gradient(135deg, #4ECDC4, #44b8af)", padding: "20px 20px 28px", borderRadius: "0 0 40px 40px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 60, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>{character.emoji}</div>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 23, color: "white", margin: "8px 0 4px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            {title || `El cuento de ${character.name}`}
          </h1>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.95)", fontWeight: 700 }}>
            {profile.avatar} {profile.name} · {category.emoji} {category.label}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "22px 20px" }}>
        {paragraphs.map((para, i) => (
          <div key={i} onClick={() => speakByIdx(i)}
            style={{
              background: currentSpeakIdx === i ? "#daf4f2" : "white",
              borderRadius: 24, padding: "17px 20px", marginBottom: 13,
              boxShadow: `0 6px 20px rgba(0,0,0,${currentSpeakIdx === i ? 0.15 : 0.08})`,
              border: currentSpeakIdx === i ? "3px solid #4ECDC4" : "3px solid transparent",
              animation: "fadeSlide 0.5s ease", cursor: "pointer", transition: "all 0.3s",
            }}>
            {currentSpeakIdx === i && (
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", marginBottom: 8 }}>
                {[0,1,2].map(j => <div key={j} style={{ width: 5, height: 14, background: "#4ECDC4", borderRadius: 3, animation: `wavebar 0.6s ${j * 0.15}s ease-in-out infinite alternate` }} />)}
                <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 13, color: "#4ECDC4", marginLeft: 6 }}>Leyendo...</span>
              </div>
            )}
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, lineHeight: 1.8, color: "#333", margin: 0, fontWeight: 700 }}>{para}</p>
            <div style={{ textAlign: "right", marginTop: 5, fontSize: 11, color: "#aaa", fontFamily: "'Nunito', sans-serif" }}>🔊 Toca para escuchar</div>
          </div>
        ))}

        {loading && (
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 56, animation: "bounce 0.7s ease infinite" }}>⭐</div>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#4ECDC4" }}>¡Espera un momento! ✨</p>
          </div>
        )}

        {showChoices && storyData && !finished && (
          <div style={{ animation: "fadeSlide 0.5s ease" }}>
            <div style={{ background: "linear-gradient(135deg, #FFE4B5, #FFD700)", borderRadius: 28, padding: "22px 18px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "3px solid #FFB347", textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 6 }}>🤔</div>
              <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 21, color: "#333", margin: "0 0 18px" }}>
                {storyData.question}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {storyData.choices?.map((choice, i) => (
                  <button key={i} onClick={() => handleChoice(choice)}
                    style={{
                      background: ["#FF6B9D", "#4ECDC4", "#FFB347"][i], border: "none", borderRadius: 20,
                      padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                      boxShadow: `0 6px 0 ${["#cc4477", "#2aa39b", "#cc8800"][i]}`, transition: "all 0.1s",
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = "translateY(4px)"}
                    onMouseUp={e => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <div style={{ width: 58, height: 58, background: "rgba(255,255,255,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, flexShrink: 0 }}>
                      {choice.emoji}
                    </div>
                    <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 19, color: "white", textAlign: "left" }}>
                      {choice.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {finished && (
          <div style={{ marginTop: 20, animation: "fadeSlide 0.5s ease", background: "linear-gradient(135deg, #FFD700, #FFA500)", borderRadius: 28, padding: 24, textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize: 64 }}>🌟</div>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 26, color: "white", margin: "8px 0 16px" }}>¡Muy bien!</p>
            <BigButton onClick={onRestart} color="white" emoji="🏠">
              <span style={{ color: "#FF6B9D" }}>¡Otro cuento!</span>
            </BigButton>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Botón flotante escuchar/parar */}
      <button
        onClick={speaking ? stopSpeaking : () => paragraphs.length > 0 && speakByIdx(paragraphs.length - 1)}
        style={{
          position: "fixed", bottom: 28, right: 20, zIndex: 100,
          background: speaking
            ? "linear-gradient(135deg, #FF6B9D, #ff8fb3)"
            : "linear-gradient(135deg, #4ECDC4, #44b8af)",
          border: "none", borderRadius: "50%", width: 66, height: 66,
          fontSize: 26, cursor: "pointer",
          boxShadow: speaking
            ? "0 6px 20px rgba(255,107,157,0.5)"
            : "0 6px 20px rgba(78,205,196,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          transform: speaking ? "scale(1.12)" : "scale(1)",
        }}
      >
        {speaking ? "⏸️" : "🔊"}
      </button>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [screen, setScreen] = useState("profiles");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const go = (s) => setScreen(s);

  const handleProfileSelect = (p) => {
    setSelectedProfile(p);
    setSelectedMode(p.mode);
    // Perfiles con modo fijo saltan directamente a categoría
    go("category");
  };

  const handleModeSelect = (m) => { setSelectedMode(m); go("category"); };
  const handleCategorySelect = (c) => { setSelectedCategory(c); go("character"); };
  const handleCharacterSelect = (c) => { setSelectedCharacter(c); go("story"); };
  const handleRestart = () => {
    setSelectedMode(null); setSelectedCategory(null); setSelectedCharacter(null);
    go("profiles");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { max-width: 500px; margin: 0 auto; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes twinkle { 0%,100% { opacity: 0.1; } 50% { opacity: 0.3; } }
        @keyframes wavebar { from { height: 5px; } to { height: 20px; } }
        input:focus { outline: none; }
      `}</style>

      {screen === "profiles" && <SelectProfileScreen onSelect={handleProfileSelect} />}
      {screen === "mode" && <SelectModeScreen profile={selectedProfile} onSelect={handleModeSelect} onBack={() => go("profiles")} />}
      {screen === "category" && (
        <SelectCategoryScreen
          profile={selectedProfile}
          onSelect={handleCategorySelect}
          onBack={() => selectedProfile?.mode ? go("profiles") : go("mode")}
        />
      )}
      {screen === "character" && (
        <SelectCharacterScreen
          profile={selectedProfile}
          category={selectedCategory}
          onSelect={handleCharacterSelect}
          onBack={() => go("category")}
        />
      )}
      {screen === "story" && selectedMode === "child" && (
        <StoryChildScreen profile={selectedProfile} category={selectedCategory} character={selectedCharacter} onRestart={handleRestart} />
      )}
      {screen === "story" && selectedMode === "baby" && (
        <StoryBabyScreen profile={selectedProfile} category={selectedCategory} character={selectedCharacter} onRestart={handleRestart} />
      )}
    </>
  );
}
