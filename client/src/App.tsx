import AppRoutes from "./routes";

function App() {
  // Frontend - Console me print karo
console.log('API_URL:', import.meta.env.VITE_API_URL)
console.log('Full login URL:', `${import.meta.env.VITE_API_URL}/api/auth/login`)

  return <AppRoutes />;
}

export default App;
