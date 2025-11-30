import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { ScrollArea } from "./components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { 
  Moon, Sun, Landmark, Map, MessageSquare, Users, PenTool, Compass, Shield, 
  LogIn, LogOut, UserPlus, Edit, Trash2, Heart, Share2, Loader2, 
  CheckCircle, AlertCircle, Eye, EyeOff, Search, Filter, Star, Clock, MapPin
} from "lucide-react";
import { toast } from "sonner@2.0.3";

// Context for global app state
const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

// Custom hook for localStorage persistence
function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch (e) {
      console.error("useLocalStorage parse error", e);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error("useLocalStorage set error", e);
    }
  }, [key, state]);

  return [state, setState];
}

// Mock API simulation
const mockAPI = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = JSON.parse(localStorage.getItem('ihe_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      return { success: true, user: { ...user, password: undefined } };
    }
    return { success: false, message: "Invalid email or password" };
  },
  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = JSON.parse(localStorage.getItem('ihe_users') || '[]');
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: "Email already registered" };
    }
    const newUser = { ...userData, id: Date.now().toString() };
    users.push(newUser);
    localStorage.setItem('ihe_users', JSON.stringify(users));
    return { success: true, user: { ...newUser, password: undefined } };
  },
  fetchMonuments: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DB().monuments;
  }
};

// Mock database
function MOCK_DB() {
  return {
    monuments: [
      { 
        id: "m1", 
        name: "Taj Mahal", 
        state: "Uttar Pradesh", 
        image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "An ivory-white marble mausoleum on the right bank of the river Yamuna in Agra, built by Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal. Completed in 1653, it stands as the jewel of Muslim art in India and one of the universally admired masterpieces of the world's heritage. The monument combines elements from Persian, Ottoman Turkish and Indian architectural styles.", 
        era: "Mughal",
        year: "1653",
        rating: 4.9,
        visitors: "7-8 million/year"
      },
      { 
        id: "m2", 
        name: "Red Fort", 
        state: "Delhi", 
        image: "https://images.unsplash.com/photo-1713729991304-d0b6c328560e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "A historic fort built in 1648 by Mughal Emperor Shah Jahan as the palace for his new capital, Shahjahanabad. Its massive red sandstone walls stretch for 2.5 km and rise to a height of 18 meters. The fort served as the main residence of Mughal emperors for nearly 200 years and contains impressive structures like Diwan-i-Aam, Diwan-i-Khas, and the pearl mosque. It's a UNESCO World Heritage Site.", 
        era: "Mughal",
        year: "1648",
        rating: 4.7,
        visitors: "3 million/year"
      },
      { 
        id: "m3", 
        name: "Qutub Minar", 
        state: "Delhi", 
        image: "https://images.unsplash.com/photo-1667849521359-067272da8156?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "A 73-meter tall tapering tower of red sandstone and marble, begun by Qutb-ud-din Aibak in 1199 and completed by his successors. It's the tallest brick minaret in the world and an outstanding example of Indo-Islamic architecture. The tower has five distinct stories, each marked by a projecting balcony with inscriptions from the Quran and intricate carvings. The complex also includes the famous Iron Pillar and Quwwat-ul-Islam Mosque.", 
        era: "Medieval",
        year: "1199",
        rating: 4.6,
        visitors: "2.5 million/year"
      },
      { 
        id: "m4", 
        name: "Gateway of India", 
        state: "Maharashtra", 
        image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "An iconic arch monument built in 1924 during the British Raj to commemorate the landing of King George V and Queen Mary at Apollo Bunder in Mumbai. Standing at 26 meters tall, it combines Hindu and Muslim architectural styles with elements of Roman triumphal arches. The monument overlooks the Arabian Sea and has become one of Mumbai's most recognizable landmarks, symbolizing both colonial history and India's independence.", 
        era: "Colonial",
        year: "1924",
        rating: 4.5,
        visitors: "4 million/year"
      },
      { 
        id: "m5", 
        name: "Hawa Mahal", 
        state: "Rajasthan", 
        image: "https://images.unsplash.com/photo-1650530777057-3a7dbc24bf6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "The Palace of Winds, built in 1799 by Maharaja Sawai Pratap Singh in Jaipur's Pink City. This five-story pink and red sandstone structure features 953 small windows called jharokhas, designed with intricate latticework. Built to allow royal ladies to observe street festivals while remaining unseen, the facade resembles a honeycomb. The monument is an excellent example of Rajput architecture blended with Mughal influence.", 
        era: "Medieval",
        year: "1799",
        rating: 4.8,
        visitors: "1.5 million/year"
      },
      { 
        id: "m6", 
        name: "Amber Fort", 
        state: "Rajasthan", 
        image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "A majestic fort palace constructed in 1592 by Raja Man Singh I, perched on a hilltop overlooking Maota Lake near Jaipur. Built with red sandstone and marble, it features four courtyards, elaborate gates, and stunning mirror work in the Sheesh Mahal. The fort exemplifies the blend of Hindu and Rajput architecture with its artistic paintings, carvings, and the beautiful Ganesh Pol gateway. It's a UNESCO World Heritage Site.", 
        era: "Medieval",
        year: "1592",
        rating: 4.9,
        visitors: "5000/day"
      },
      { 
        id: "m7", 
        name: "Hampi Ruins", 
        state: "Karnataka", 
        image: "https://images.unsplash.com/photo-1631986683754-7d511e03864d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "Ancient village featuring ruins of the former Vijayanagara Empire capital, which flourished from 1336 to 1565. The site contains over 1,600 monuments including temples, palaces, fortifications, and water structures spread across 4,100 hectares. The Virupaksha Temple, stone chariot, and Vittala Temple complex showcase remarkable Dravidian architecture. Hampi is a UNESCO World Heritage Site and represents one of the greatest Hindu kingdoms in Indian history.", 
        era: "Medieval",
        year: "1336",
        rating: 4.7,
        visitors: "500k/year"
      },
      { 
        id: "m8", 
        name: "Mysore Palace", 
        state: "Karnataka", 
        image: "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "A spectacular palace built between 1897 and 1912 as the official residence of the Wadiyar dynasty, who ruled the Kingdom of Mysore. The three-storied structure combines Hindu, Muslim, Rajput, and Gothic architectural styles. It features magnificent domes, arches, and pillars with intricate carvings. The palace houses ornate halls, paintings, and the Golden Howdah throne. During Dussehra festival, it's illuminated with nearly 100,000 lights, creating a breathtaking spectacle.", 
        era: "Colonial",
        year: "1912",
        rating: 4.8,
        visitors: "6 million/year"
      },
      { 
        id: "m9", 
        name: "Konark Sun Temple", 
        state: "Odisha", 
        image: "https://images.unsplash.com/photo-1677211352662-30e7775c7ce8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "A 13th-century Hindu temple built by King Narasimhadeva I, dedicated to the Sun God Surya. Designed as a giant stone chariot with 12 pairs of elaborately carved stone wheels pulled by seven horses, it represents the chariot of the Sun God. The temple showcases exquisite Kalinga architecture with intricate erotic sculptures, mythological figures, and geometric patterns. Though partially in ruins, it remains one of India's most iconic monuments and a UNESCO World Heritage Site.", 
        era: "Medieval",
        year: "1250",
        rating: 4.8,
        visitors: "3000/day"
      },
      { 
        id: "m10", 
        name: "Ajanta Caves", 
        state: "Maharashtra", 
        image: "https://images.unsplash.com/photo-1620558601903-9f2441730121?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "Ancient Buddhist cave monuments carved into a horseshoe-shaped cliff, dating from the 2nd century BCE to 480 CE. The 30 rock-cut caves contain paintings and sculptures depicting the life of Buddha and various Buddhist deities. These masterpieces of Buddhist religious art influenced Indian art for centuries. The caves showcase remarkable technique and artistry with natural pigments that have survived for over 2,000 years. Recognized as a UNESCO World Heritage Site.", 
        era: "Ancient",
        year: "200 BCE",
        rating: 4.7,
        visitors: "200k/year"
      },
      { 
        id: "m11", 
        name: "Victoria Memorial", 
        state: "West Bengal", 
        image: "https://images.unsplash.com/photo-1697817665440-f988c6d5080f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "A grand marble building constructed between 1906 and 1921 to commemorate Queen Victoria's 25 years of rule in India. Built in Indo-Saracenic Revival style with Mughal and Venetian influences, it features a 64-meter high central dome crowned with a bronze Victory Angel. Set in 64 acres of manicured gardens, it now serves as a museum housing paintings, sculptures, and artifacts from the British Raj period. A symbol of Kolkata's colonial heritage.", 
        era: "Colonial",
        year: "1921",
        rating: 4.6,
        visitors: "2 million/year"
      },
      { 
        id: "m12", 
        name: "Charminar", 
        state: "Telangana", 
        image: "https://images.unsplash.com/photo-1696941515998-d83f24967aca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "An iconic monument built in 1591 by Muhammad Quli Qutb Shah to commemorate the end of a deadly plague in Hyderabad. The name means 'Four Towers' in Urdu, featuring four grand arches facing the cardinal directions. Standing 56 meters tall with 149 winding steps to the upper floor, it combines Islamic and Persian architectural styles. The monument houses a mosque on the top floor and has become the most recognized structure and symbol of Hyderabad.", 
        era: "Medieval",
        year: "1591",
        rating: 4.5,
        visitors: "10k/day"
      },
      { 
        id: "m13", 
        name: "Meenakshi Temple", 
        state: "Tamil Nadu", 
        image: "https://images.unsplash.com/photo-1692173248120-59547c3d4653?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "A historic Hindu temple dedicated to Goddess Meenakshi (Parvati) and her consort Sundareshwar (Shiva), located in Madurai. The temple complex spans 14 acres with 12 towering gopurams (gateway towers) covered with thousands of colorful sculptures depicting gods, goddesses, and mythological creatures. Built between 1623 and 1655, it represents the pinnacle of Dravidian architecture. The Hall of Thousand Pillars showcases stunning stone carvings and is a major pilgrimage site.", 
        era: "Medieval",
        year: "1655",
        rating: 4.9,
        visitors: "15k/day"
      },
      { 
        id: "m14", 
        name: "Golden Temple", 
        state: "Punjab", 
        image: "https://images.unsplash.com/photo-1623059508779-2542c6e83753?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "Also known as Harmandir Sahib, this holiest Gurdwara of Sikhism was founded by Guru Ramdas Ji in 1577 and completed by Guru Arjan Dev Ji in 1604. The upper floors are covered with gold leaf, giving it its iconic appearance. The temple sits in the center of a sacred pool (Amrit Sarovar) and welcomes people of all religions. The complex serves free meals to over 100,000 people daily, exemplifying Sikh principles of equality and service.", 
        era: "Medieval",
        year: "1604",
        rating: 5.0,
        visitors: "100k/day"
      },
      { 
        id: "m15", 
        name: "Khajuraho Temples", 
        state: "Madhya Pradesh", 
        image: "https://images.unsplash.com/photo-1606298855672-3efb63017be8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: "A group of Hindu and Jain temples built between 950 and 1050 CE by the Chandela dynasty. Famous worldwide for their intricate erotic sculptures representing the tantric traditions, these temples showcase exceptional Nagara-style architecture. Only 25 of the original 85 temples survive today. The sculptures depict various aspects of life including gods, goddesses, warriors, musicians, and daily activities. The temples are renowned for their architectural symbolism and sophisticated sandstone carvings. UNESCO World Heritage Site.", 
        era: "Medieval",
        year: "1050",
        rating: 4.7,
        visitors: "500k/year"
      },
    ],
    tours: [
      { 
        id: "t1", 
        title: "Taj Mahal 360° Virtual Tour", 
        url: "https://www.youtube.com/embed/4Qe8rYc1zKQ", 
        thumbnail: "https://images.unsplash.com/photo-1564507592333-c60657eea523?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
        duration: "15 min"
      },
      { 
        id: "t2", 
        title: "Hampi Heritage Walkthrough", 
        url: "https://www.youtube.com/embed/5o2KpZ4Zk0o", 
        thumbnail: "https://images.unsplash.com/photo-1631986683754-7d511e03864d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
        duration: "20 min"
      },
    ],
    posts: [
      { 
        id: "p1", 
        author: "Anita Sharma", 
        title: "Preserving traditional folk music", 
        body: "How can we help local folk musicians preserve and share their art with younger generations?", 
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
        likes: 45,
        comments: 12
      },
    ],
  };
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useApp();
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// Login Page
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await mockAPI.login(email, password);
      if (result.success) {
        setUser(result.user);
        toast.success("Login successful! Welcome back.");
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        toast.error(result.message);
        setErrors({ general: result.message });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center mb-4">
              <Landmark className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Welcome Back</CardTitle>
            <CardDescription>Login to explore India's heritage</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: "" });
                  }}
                  className={errors.email ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm mb-2 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: "" });
                    }}
                    className={errors.password ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.general}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link to="/register" className="text-amber-600 hover:text-amber-700 font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Register Page
function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Visitor"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await mockAPI.register(formData);
      if (result.success) {
        setUser(result.user);
        toast.success("Registration successful! Welcome to Indian Heritage Explorer.");
        navigate("/", { replace: true });
      } else {
        toast.error(result.message);
        setErrors({ general: result.message });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Create Account</CardTitle>
            <CardDescription>Join us to explore India's rich heritage</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm mb-2 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm mb-2 block">Role</label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visitor">Visitor</SelectItem>
                    <SelectItem value="Content Creator">Content Creator</SelectItem>
                    <SelectItem value="Tour Guide">Tour Guide</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm mb-2 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm mb-2 block">Confirm Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.general}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-amber-600 hover:text-amber-700 font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Header Component
function Header() {
  const { theme, setTheme, user, setUser } = useApp();
  const navigate = useNavigate();
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleLogout = () => {
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-40 border-b shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="rounded-full bg-gradient-to-br from-amber-600 to-orange-600 text-white w-11 h-11 flex items-center justify-center"
          >
            <Landmark className="w-6 h-6" />
          </motion.div>
          <div>
            <h1 className="font-bold">Indian Heritage Explorer</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">Inspiring awareness of culture & heritage</p>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <NavLink to="/" icon={<Landmark className="w-4 h-4" />}>Home</NavLink>
              <NavLink to="/explore" icon={<Compass className="w-4 h-4" />}>Explore</NavLink>
              <NavLink to="/tours" icon={<Map className="w-4 h-4" />}>Tours</NavLink>
              <NavLink to="/discussions" icon={<MessageSquare className="w-4 h-4" />}>Discussions</NavLink>
              
              <Badge variant="outline" className="ml-2 px-3 py-1">
                <Users className="w-3 h-3 mr-1" />
                {user.role}
              </Badge>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggle} 
                aria-label="toggle theme"
                className="relative"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === "dark" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </motion.div>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="ml-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggle} 
                aria-label="toggle theme"
              >
                {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/login")}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}

function NavLink({ to, children, icon }) {
  return (
    <Link to={to} className="flex items-center gap-1.5 text-sm hover:text-amber-600 transition-colors relative group">
      {icon}
      <span>{children}</span>
      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-600"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
    </Link>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="mt-16 border-t py-8 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>© {new Date().getFullYear()} Indian Heritage Explorer. Preserving culture, inspiring awareness.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-amber-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-amber-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-amber-600 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

// Monument Card with enhanced interactions
function MonumentCard({ monument, onOpen, favorites, onToggleFavorite }) {
  const isFavorite = favorites.includes(monument.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="cursor-pointer overflow-hidden h-full shadow-lg hover:shadow-2xl transition-shadow">
        <div className="aspect-video w-full overflow-hidden relative group">
          <ImageWithFallback 
            src={monument.image} 
            alt={monument.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(monument.id);
              }}
              className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-700" />
            </motion.button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center gap-2 text-white text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{monument.rating}</span>
              <span className="text-white/80">• {monument.visitors}</span>
            </div>
          </div>
        </div>
        <CardHeader onClick={() => onOpen(monument)}>
          <CardTitle className="flex items-start justify-between">
            <span>{monument.name}</span>
            <Badge variant="secondary" className="text-xs">{monument.era}</Badge>
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span>{monument.state}</span>
            <span className="text-xs text-gray-400">• Built {monument.year}</span>
          </CardDescription>
        </CardHeader>
        <CardContent onClick={() => onOpen(monument)}>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{monument.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Tour Card
function TourCard({ tour, onOpen }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl transition-shadow" onClick={() => onOpen(tour)}>
        <div className="aspect-video w-full overflow-hidden relative group">
          <ImageWithFallback 
            src={tour.thumbnail} 
            alt={tour.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center shadow-2xl"
            >
              <Map className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-sm bg-black/50 backdrop-blur px-3 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            {tour.duration}
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-lg">{tour.title}</CardTitle>
          <CardDescription>Immersive 360° virtual experience</CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );
}

// Home Page
function HomePage() {
  const { monuments, tours, posts } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="grid md:grid-cols-2 gap-12 items-center mb-16"
      >
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-300">
            Explore India's Heritage
          </Badge>
          <h2 className="text-5xl mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Discover the Soul of India
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
            Embark on a journey through time. Explore magnificent monuments, take immersive virtual tours, 
            and connect with a community passionate about preserving India's rich cultural tapestry.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Button asChild size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg">
              <Link to="/explore">
                <Compass className="w-5 h-5 mr-2" />
                Start Exploring
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="shadow-lg">
              <Link to="/tours">
                <Map className="w-5 h-5 mr-2" />
                Virtual Tours
              </Link>
            </Button>
          </div>
        </motion.div>
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="rounded-2xl overflow-hidden shadow-2xl relative"
        >
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1598623451525-3c9f58a9d140?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Indian Heritage" 
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </motion.div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
      >
        <StatCard icon={<Landmark className="w-8 h-8" />} label="Heritage Sites" value={monuments.length} color="amber" />
        <StatCard icon={<Map className="w-8 h-8" />} label="Virtual Tours" value={tours.length} color="orange" />
        <StatCard icon={<MessageSquare className="w-8 h-8" />} label="Discussions" value={posts.length} color="red" />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <h3 className="text-3xl mb-6">Featured Monuments</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {monuments.slice(0, 3).map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              <Link to="/explore">
                <Card className="overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer group">
                  <div className="aspect-video overflow-hidden">
                    <ImageWithFallback 
                      src={m.image}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {m.name}
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </CardTitle>
                    <CardDescription>{m.state}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </main>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    amber: "text-amber-600 from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
    orange: "text-orange-600 from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
    red: "text-red-600 from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20"
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
      <Card className={`bg-gradient-to-br ${colorClasses[color]} border-none shadow-lg`}>
        <CardContent className="pt-6 text-center">
          <motion.div 
            className={`flex justify-center mb-3 ${colorClasses[color].split(' ')[0]}`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
          <motion.div 
            className="text-4xl mb-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {value}
          </motion.div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Explore Page with enhanced filtering
function ExplorePage() {
  const { setModal, monuments } = useApp();
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [eraFilter, setEraFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useLocalStorage('ihe_favorites', []);

  const filtered = monuments.filter(m => {
    const q = query.toLowerCase();
    if (stateFilter !== "all" && m.state !== stateFilter) return false;
    if (eraFilter !== "all" && m.era !== eraFilter) return false;
    return m.name.toLowerCase().includes(q) || 
           m.description.toLowerCase().includes(q) || 
           m.era.toLowerCase().includes(q) ||
           m.state.toLowerCase().includes(q);
  });

  const states = Array.from(new Set(monuments.map(m => m.state)));
  const eras = Array.from(new Set(monuments.map(m => m.era)));

  const handleToggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
    toast.success(favorites.includes(id) ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-4xl mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Explore Heritage Sites
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover {monuments.length} magnificent monuments across India
            </p>
          </div>
          {favorites.length > 0 && (
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Heart className="w-4 h-4 mr-2 fill-red-500 text-red-500" />
              {favorites.length} Favorites
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Search monuments, cities, dynasties..." 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              className="pl-10 shadow-lg"
            />
          </div>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-full sm:w-[200px] shadow-lg">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={eraFilter} onValueChange={setEraFilter}>
            <SelectTrigger className="w-full sm:w-[200px] shadow-lg">
              <Clock className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Eras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Eras</SelectItem>
              {eras.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </motion.header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(m => (
              <MonumentCard 
                key={m.id} 
                monument={m} 
                onOpen={(m) => setModal({ type: 'monument', payload: m })}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {!loading && filtered.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">No monuments found</p>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </main>
  );
}

// Tours Page
function ToursPage() {
  const { tours, setModal } = useApp();
  
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-4xl mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Virtual Tours
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Step into iconic sites with immersive 360° experiences. Click any card to begin your virtual journey.
        </p>
      </motion.div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map(t => (
          <TourCard 
            key={t.id} 
            tour={t} 
            onOpen={(t) => setModal({ type: 'tour', payload: t })} 
          />
        ))}
      </div>
    </main>
  );
}

// Discussions Page with CRUD
function DiscussionsPage() {
  const { posts, addPost, removePost, user } = useApp();
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  function submit(e) {
    e.preventDefault();
    if (!author.trim() || !title.trim()) {
      setError("Please enter both name and topic title.");
      return;
    }
    if (editingId) {
      // Update logic would go here
      toast.success("Discussion updated successfully");
      setEditingId(null);
    } else {
      addPost({ author: author.trim(), title: title.trim(), body: body.trim(), createdAt: Date.now(), likes: 0, comments: 0 });
      toast.success("Discussion created successfully!");
    }
    setAuthor("");
    setTitle("");
    setBody("");
    setError(null);
  }

  const handleDelete = (id) => {
    removePost(id);
    toast.success("Discussion deleted successfully");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h3 className="text-4xl mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Community Discussions
        </h3>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-amber-600" />
              {editingId ? "Edit Discussion" : "Start a New Discussion"}
            </CardTitle>
            <CardDescription>Share your thoughts and engage with the community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Input 
                    placeholder="Your name" 
                    value={author} 
                    onChange={e => {
                      setAuthor(e.target.value);
                      setError(null);
                    }}
                  />
                </div>
                <div>
                  <Input 
                    placeholder="Topic title" 
                    value={title} 
                    onChange={e => {
                      setTitle(e.target.value);
                      setError(null);
                    }}
                  />
                </div>
              </div>
              <Textarea
                placeholder="Share your thoughts... (optional)"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={3}
              />
              {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {editingId ? "Update Post" : "Create Post"}
                </Button>
                {editingId && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setEditingId(null);
                      setAuthor("");
                      setTitle("");
                      setBody("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.header>

      <div className="space-y-4">
        <AnimatePresence>
          {posts.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{p.title}</CardTitle>
                      <CardDescription className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {p.author}
                        </span>
                        <span>•</span>
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {p.body && (
                  <CardContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{p.body}</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                      <button className="flex items-center gap-2 hover:text-red-600 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{p.likes} likes</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-amber-600 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>{p.comments} comments</span>
                      </button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}

// Modal Components
function MonumentModal({ monument, onClose }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{monument.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-3 text-base">
            <MapPin className="w-4 h-4" />
            {monument.state} • {monument.era} Era • Built {monument.year}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ImageWithFallback 
              src={monument.image} 
              alt={monument.name} 
              className="w-full h-80 object-cover rounded-lg shadow-lg"
            />
          </motion.div>
          
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400 mx-auto mb-2" />
                <div className="text-2xl">{monument.rating}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Users className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl">{monument.visitors}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Visitors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl">{monument.year}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Built</p>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h4 className="text-lg mb-3">About this Monument</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{monument.description}</p>
          </div>
          
          <div className="flex gap-3">
            <Button className="flex-1 bg-amber-600 hover:bg-amber-700">
              <Map className="w-4 h-4 mr-2" />
              View on Map
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TourModal({ tour, onClose }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{tour.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {tour.duration} • Immersive 360° virtual experience
          </DialogDescription>
        </DialogHeader>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl"
        >
          <iframe 
            src={tour.url} 
            title={tour.title} 
            className="w-full h-full" 
            allowFullScreen 
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// Main App Component
export default function App() {
  const [theme, setTheme] = useLocalStorage('ihe_theme', 'light');
  const [user, setUser] = useLocalStorage('ihe_user', null);
  const [monuments, setMonuments] = useLocalStorage('ihe_monuments', MOCK_DB().monuments);
  const [tours, setTours] = useLocalStorage('ihe_tours', MOCK_DB().tours);
  const [posts, setPosts] = useLocalStorage('ihe_posts', MOCK_DB().posts);
  const [modal, setModal] = useState(null);

  const addPost = (p) => {
    const newP = { id: 'p_' + Date.now(), ...p };
    setPosts(prev => [newP, ...prev]);
  };

  const removePost = (id) => setPosts(prev => prev.filter(x => x.id !== id));
  const removeMonument = (id) => setMonuments(prev => prev.filter(x => x.id !== id));
  const closeModal = () => setModal(null);

  const value = useMemo(() => ({
    theme, setTheme, user, setUser,
    monuments, setMonuments, tours, setTours, posts, setPosts,
    modal, setModal, closeModal,
    addPost, removePost, removeMonument,
  }), [theme, user, monuments, tours, posts, modal]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); 
    else root.classList.remove('dark');
  }, [theme]);

  return (
    <AppContext.Provider value={value}>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <Header />

          <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
            <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" replace />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
            <Route path="/tours" element={<ProtectedRoute><ToursPage /></ProtectedRoute>} />
            <Route path="/discussions" element={<ProtectedRoute><DiscussionsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <AnimatePresence>
            {modal?.type === 'monument' && (
              <MonumentModal monument={modal.payload} onClose={closeModal} />
            )}
            {modal?.type === 'tour' && (
              <TourModal tour={modal.payload} onClose={closeModal} />
            )}
          </AnimatePresence>

          <Footer />
        </div>
      </Router>
    </AppContext.Provider>
  );
}
