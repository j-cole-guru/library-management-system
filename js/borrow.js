(function () {
  redirectIfNotLoggedIn();

  async function loadBorrowedBooks() {
    try {
      const data = await apiFetch("/my-books");
      const borrows = data.borrows || data;
      const container = document.getElementById("borrowedContainer");

      if (borrows.length === 0) {
        container.innerHTML =
          '<p style="color:var(--gray);text-align:center;">You haven\'t borrowed any books yet. <a href="books.html" style="color:var(--gold);">Browse books</a></p>';
        return;
      }

      container.innerHTML = borrows
        .map((b) => {
          const isActive = b.status === "active";
          const statusBadge = isActive
            ? '<span class="badge badge-active">Active</span>'
            : '<span class="badge badge-returned">Returned</span>';
          const returnBtn = isActive
            ? `<button class="btn btn-danger" onclick="returnBook('${b._id}')">Return</button>`
            : "";

          return `
          <div class="borrow-card">
            <div class="borrow-info">
              <h4>${b.bookId?.title || "Unknown Book"}</h4>
              <p>${b.bookId?.author || ""} — Borrowed: ${new Date(b.borrowDate).toLocaleDateString()}${b.returnDate ? " | Returned: " + new Date(b.returnDate).toLocaleDateString() : ""}</p>
            </div>
            <div class="borrow-actions">
              ${statusBadge}
              ${returnBtn}
            </div>
          </div>
        `;
        })
        .join("");
    } catch (err) {
      document.getElementById("borrowedContainer").innerHTML =
        `<p style="color:var(--danger);text-align:center;">Failed to load borrowed books: ${err.message}</p>`;
    }
  }

  window.returnBook = async function (borrowId) {
    if (!confirm("Are you sure you want to return this book?")) return;
    try {
      await apiFetch(`/return/${borrowId}`, { method: "POST" });
      alert("Book returned successfully!");
      loadBorrowedBooks();
    } catch (err) {
      alert("Failed to return: " + err.message);
    }
  };

  loadBorrowedBooks();
})();
