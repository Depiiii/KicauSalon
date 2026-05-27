const API_USER = "http://localhost:3001/api";

// LOGIN
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(`${API_USER}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {

        if (data.user && data.user.id_user) {
            alert("Login berhasil");

            localStorage.setItem("id_user", data.user.id_user);

            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Login gagal");
        }
    });
}

// REGISTER
function register() {
    const nama = document.getElementById("nama").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const no_telepon = document.getElementById("no_telepon").value;

    fetch(`${API_USER}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password, no_telepon })
    })
    .then(res => res.json())
    .then(() => {
        alert("Register berhasil");
        window.location.href = "index.html";
    });
}
function logout() {
    localStorage.removeItem("id_user");
    alert("Logout berhasil");
    window.location.href = "index.html";
}