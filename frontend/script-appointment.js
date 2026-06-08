const API_APPOINTMENT = "http://localhost:3004/graphql";

//------------------------------RIWAYAT AREA------------------------------

function formatJam(jam) {
    return `${String(jam).padStart(2, "0")}:00`;
}

async function loadRiwayat() {

    const id_user = localStorage.getItem("id_user");

    const query = `
    query {
        riwayatUser(id_user:${id_user}) {
            id_appointment
            tanggal
            Jam
            status
            layanan
            nama_stylist
            harga
        }
    }
    `;

    try {

        const response = await fetch(API_APPOINTMENT, {
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

        const data = result.data.riwayatUser;

        let html = "";

        if (data.length === 0) {

            html = `
            <tr>
                <td colspan="7"
                    class="py-10 text-center text-text-muted">
                    Belum ada riwayat appointment
                </td>
            </tr>
            `;

        } else {

            data.forEach(item => {

                const badgeColor =
                    item.status === "Lunas"
                        ? "bg-green-500/15 text-green-400"
                        : item.status === "Belum Bayar"
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-red-500/15 text-red-400";

                html += `
                <tr class="border-b border-outline-variant/30 hover:bg-surface-container-high transition">

                    <td class="px-4 py-4">
                        #${item.id_appointment}
                    </td>

                    <td class="px-4 py-4">
                        ${item.tanggal}
                    </td>

                    <td class="px-4 py-4">
                        ${formatJam(item.Jam)}
                    </td>

                    <td class="px-4 py-4">
                        ${item.layanan}
                    </td>

                    <td class="px-4 py-4">
                        ${item.nama_stylist}
                    </td>

                    <td class="px-4 py-4 font-semibold text-secondary">
                        Rp ${Number(item.harga).toLocaleString("id-ID")}
                    </td>

                    <td class="px-4 py-4">
                        <span class="${badgeColor} px-3 py-1 rounded-full text-sm">
                            ${item.status}
                        </span>
                    </td>

                </tr>
                `;
            });
        }

        document.getElementById("riwayatTable").innerHTML = html;

    } catch (error) {

        console.error(error);
        alert("Gagal memuat riwayat");

    }
}

