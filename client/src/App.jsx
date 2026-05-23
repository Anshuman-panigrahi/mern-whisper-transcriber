import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [message, setMessage] = useState("");

  useEffect(() => {

    axios.get("http://localhost:5000/api/test")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px"
      }}
    >
      <h1>Speech To Text App 🚀</h1>

      <h2>{message}</h2>
    </div>
  );
}

export default App;