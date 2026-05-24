import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {

            await axios.post(
                "http://localhost:5001/api/auth/register",
                {
                    username,
                    email,
                    password
                }
            );

            alert("Register Successful");
            navigate("/");

        } catch (error) {
            console.log(error.response?.data || error);
            alert(error.response?.data?.message || "Register Failed");
        }

    };

    return (
        <div className="container">
            <form onSubmit={handleRegister} className="form">
                <h1>Register</h1>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">
                    Register
                </button>
            </form>
        </div>
    );
}

export default Register;