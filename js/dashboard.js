(function () {
  redirectIfNotLoggedIn();

  let user = getUser();

  async function loadDashboard() {
    try {
      const profile = await apiFetch("/auth/profile");
      user = profile.user || profile;
      saveAuth(getToken(), user);
      document.getElementById("userName").textContent = user.name || "User";

      if (user.role === "admin") {
        document.getElementById("adminPanel").style.display = "block";
      }

      const booksData = await apiFetch("/my-books");
      const borrows = booksData.borrows || booksData;

      const activeBorrows = borrows.filter((b) => b.status === "active");
      const returnedBorrows = borrows.filter((b) => b.status === "returned");
      const totalBorrows = borrows.length;

      document.getElementById("statsGrid").innerHTML = `
        <div class="stat-card">
          <h3>Total Borrowed</h3>
          <div class="stat-number">${totalBorrows}</div>
        </div>
        <div class="stat-card">
          <h3>Currently Reading</h3>
          <div class="stat-number">${activeBorrows.length}</div>
        </div>
        <div class="stat-card">
          <h3>Returned</h3>
          <div class="stat-number">${returnedBorrows.length}</div>
        </div>
      `;

      const recentEl = document.getElementById("recentBorrows");
      if (borrows.length === 0) {
        recentEl.innerHTML = "<p style='color:var(--gray);'>No borrows yet. <a href='books.html' style='color:var(--gold);'>Browse books</a></p>";
      } else {
        recentEl.innerHTML = borrows.slice(0, 5).map((b) => {
          const statusClass = b.status === "active" ? "badge-active" : "badge-returned";
          return `
            <div class="borrow-item">
              <div class="book-info">
                <h4>${b.bookId?.title || "Unknown Book"}</h4>
                <p>${b.bookId?.author || ""} — Borrowed: ${new Date(b.borrowDate).toLocaleDateString()}</p>
              </div>
              <span class="badge ${statusClass}">${b.status}</span>
            </div>
          `;
        }).join("");
      }
    } catch (err) {
      document.getElementById("statsGrid").innerHTML =
        `<p style="color:var(--danger);">Failed to load dashboard: ${err.message}</p>`;
    }
  }

  loadDashboard();
})();
