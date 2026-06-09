(function () {
  let allBooks = [];

  async function loadBooks() {
    try {
      const data = await apiFetch("/books");
      allBooks = data.books || data;
      populateCategories(allBooks);
      renderBooks(allBooks);
    } catch (err) {
      const container = document.getElementById("booksContainer");
      if (container) {
        container.innerHTML = `<p style="color:var(--danger);text-align:center;">Failed to load books: ${err.message}</p>`;
      }
    }
  }

  function populateCategories(books) {
    const filter = document.getElementById("categoryFilter");
    if (!filter) return;
    const categories = [...new Set(books.map((b) => b.category).filter(Boolean))];
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      filter.appendChild(opt);
    });
  }

  function renderBooks(books) {
    const container = document.getElementById("booksContainer");
    if (!container) return;
    if (books.length === 0) {
      container.innerHTML = "<p style='text-align:center;color:var(--gray);'>No books found.</p>";
      return;
    }
    container.innerHTML = books
      .map(
        (book) => `
      <div class="book-card">
        <img src="${book.coverImage || "https://via.placeholder.com/300x400?text=No+Cover"}" alt="${book.title}">
        <div class="card-body">
          <h3>${book.title}</h3>
          <p>${book.author}</p>
          <a href="book-details.html?id=${book._id}" class="btn">View Details</a>
        </div>
      </div>
    `
      )
      .join("");
  }

  function filterBooks() {
    const query = (document.getElementById("searchInput")?.value || "").toLowerCase();
    const category = document.getElementById("categoryFilter")?.value || "";
    const filtered = allBooks.filter((book) => {
      const matchSearch =
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query);
      const matchCategory = !category || book.category === category;
      return matchSearch && matchCategory;
    });
    renderBooks(filtered);
  }

  function loadBookDetails() {
    const container = document.getElementById("bookDetail");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      container.innerHTML = "<p style='color:var(--danger);'>No book ID provided.</p>";
      return;
    }

    (async () => {
      try {
        const data = await apiFetch(`/books/${id}`);
        const book = data.book || data;
        const loggedIn = isLoggedIn();
        const copiesAvail = book.availableCopies != null ? book.availableCopies : book.totalCopies;
        const isAvailable = copiesAvail > 0;

        container.innerHTML = `
          <div class="book-detail">
            <div class="book-cover">
              <img src="${book.coverImage || "https://via.placeholder.com/300x400?text=No+Cover"}" alt="${book.title}">
            </div>
            <div class="book-info">
              <h1>${book.title}</h1>
              <p class="author">by ${book.author}</p>
              <div class="meta">
                <span><strong>Category:</strong> ${book.category || "N/A"}</span>
                <span><strong>ISBN:</strong> ${book.isbn || "N/A"}</span>
                <span><strong>Total Copies:</strong> ${book.totalCopies || "N/A"}</span>
              </div>
              <div class="availability ${isAvailable ? "available" : "unavailable"}">
                ${isAvailable ? "&#10003; Available (" + copiesAvail + " copies)" : "&#10007; Currently Unavailable"}
              </div>
              <p class="description">${book.description || "No description available."}</p>
              ${loggedIn && isAvailable ? `<button class="btn btn-primary" onclick="borrowBook('${book._id}')">Borrow This Book</button>` : ""}
              ${!loggedIn ? `<p style="color:var(--gray);"><a href="login.html" style="color:var(--gold);">Login</a> to borrow this book.</p>` : ""}
            </div>
          </div>
        `;
      } catch (err) {
        container.innerHTML = `<p style="color:var(--danger);">Failed to load book: ${err.message}</p>`;
      }
    })();
  }

  window.borrowBook = async function (bookId) {
    try {
      await apiFetch(`/borrow/${bookId}`, { method: "POST" });
      alert("Book borrowed successfully!");
      loadBookDetails();
    } catch (err) {
      alert("Failed to borrow: " + err.message);
    }
  };

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  if (searchInput) {
    searchInput.addEventListener("input", filterBooks);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterBooks);
  }

  if (document.getElementById("booksContainer")) {
    loadBooks();
  }

  if (document.getElementById("bookDetail")) {
    loadBookDetails();
  }
})();
