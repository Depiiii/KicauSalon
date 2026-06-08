const API_GRAPHQL = "http://localhost:3000/graphql";

//-------------------------------------------------USER AREA-------------------------------------------------
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
        id_user
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
                "id_user",
                result.data.login.id_user
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
//-------------------------------------------------PROFILE AREA-------------------------------------------------

let editMode = false;

async function loadProfile() {

    const id_user = localStorage.getItem("id_user");

    if (!id_user) {
        alert("Silakan login terlebih dahulu");
        window.location.href = "index.html";
        return;
    }

    const query = `
    query {
        user(id_user:${id_user}) {
            id_user
            nama
            email
            no_telepon
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
                query
            })
        });

        const result = await response.json();

        console.log(result);

        const user = result.data.user;

        document.getElementById("nama").value =
            user.nama || "";

        document.getElementById("email").value =
            user.email || "";

        document.getElementById("telepon").value =
            user.no_telepon || "";

    } catch (error) {

        console.error(error);

        alert("Gagal memuat profil");
    }
}

function toggleEdit() {

    const btn = document.getElementById("editBtn");

    if (!editMode) {

        document.getElementById("nama").disabled = false;
        document.getElementById("email").disabled = false;
        document.getElementById("telepon").disabled = false;
        document.getElementById("password").disabled = false;

        btn.innerText = "Simpan Perubahan";

        editMode = true;

    } else {

        saveProfile();
    }
}

async function saveProfile() {

    const id_user = localStorage.getItem("id_user");

    const nama = document.getElementById("nama").value;
    const email = document.getElementById("email").value;
    const no_telepon = document.getElementById("telepon").value;
    const password = document.getElementById("password").value;

    const query = `
    mutation {
        updateUser(
            id_user:${id_user}
            nama:"${nama}"
            email:"${email}"
            no_telepon:"${no_telepon}"
            password:"${password}"
        ) {
            id_user
            nama
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
                query
            })
        });

        const result = await response.json();

        if (result.errors) {
            alert(result.errors[0].message);
            return;
        }

        alert("Profil berhasil diperbarui");

        document.getElementById("nama").disabled = true;
        document.getElementById("email").disabled = true;
        document.getElementById("telepon").disabled = true;
        document.getElementById("password").disabled = true;

        document.getElementById("password").value = "";

        document.getElementById("editBtn").innerText = "Edit Profil";

        editMode = false;

        loadProfile();

    } catch (error) {

        console.error(error);

        alert("Gagal update profil");
    }
}

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("id_user");
    localStorage.removeItem("role");
    localStorage.removeItem("nama");

    alert("Logout berhasil");

    window.location.href = "index.html";
}

