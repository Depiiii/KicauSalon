const API_GRAPHQL = "http://localhost:3000/graphql";

// LOGIN
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const query = `
        mutation {
            login(
                email: "${email}"
                password: "${password}"
            ) {
                token
                nama
                role
            }
        }
    `;

    try {
        const response = await fetch(API_GRAPHQL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: query
            })
        });

        const result = await response.json();

        if (result.data && result.data.login) {

            localStorage.setItem(
                "token",
                result.data.login.token
            );

            localStorage.setItem(
                "role",
                result.data.login.role
            );

            localStorage.setItem(
                "nama",
                result.data.login.nama
            );

            alert("Login berhasil");

            if (result.data.login.role === "admin") {
                window.location.href = "Admin/appointment-admin.html";
            } else {
                window.location.href = "dashboard.html";
            }

        } else {
            alert("Login gagal");
            console.log(result);
        }

    } catch (error) {
        console.error(error);
        alert("Server error");
    }
}
async function register() {
    const nama = document.getElementById("nama").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const no_telepon = document.getElementById("no_telepon").value;

    const query = `
        mutation {
            register(
                nama: "${nama}"
                email: "${email}"
                password: "${password}"
                no_telepon: "${no_telepon}"
            ) {
                id_user
                nama
                email
                role
            }
        }
    `;

    try {
        const response = await fetch(API_GRAPHQL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: query
            })
        });

        const result = await response.json();

        if (result.data && result.data.register) {
            alert("Register berhasil");
            window.location.href = "index.html";
        } else {
            alert("Register gagal");
            console.log(result);
        }

    } catch (error) {
        console.error(error);
        alert("Server error");
    }
}
function logout() {
    localStorage.removeItem("id_user");
    alert("Logout berhasil");
    window.location.href = "index.html";
}

