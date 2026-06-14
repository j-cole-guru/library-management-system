(function () {
  let allBooks = [];

  async function loadBooks() {
    try {
      allBooks = await apiFetch("/books");
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
        <img src="https://via.placeholder.com/300x400?text=No+Cover" alt="${book.title}">
        <div class="card-body">
          <h3>${book.title}</h3>
          <p>${book.author}</p>
          <a href="book-details.html?id=${book.id || book._id}" class="btn">View Details</a>
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
        (book.author || "").toLowerCase().includes(query);
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
        const book = await apiFetch(`/books/${id}`);
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        let isBorrowed = false;
        if (token) {
          try {
            const statusRes = await apiFetch(`/books/${id}/borrow-status`);
            isBorrowed = statusRes.borrowed;
          } catch (_) {}
        }

        function renderDetail(currentBook, borrowed) {
          const copies = currentBook.copies || 0;
          const isAvailable = copies > 0;

          // Borrow button logic
          let borrowSection = "";
          if (token && role !== "admin") {
            if (borrowed) {
              borrowSection = `
                <button id="borrowBtn" class="btn btn-danger" style="margin-top:1.2rem;">
                  &#8617; Return Book
                </button>
              `;
            } else if (isAvailable) {
              borrowSection = `
                <button id="borrowBtn" class="btn btn-primary" style="margin-top:1.2rem;">
                  &#128218; Borrow Book
                </button>
              `;
            } else {
              borrowSection = `
                <button class="btn" style="margin-top:1.2rem;opacity:0.5;cursor:not-allowed;" disabled>
                  No Copies Available
                </button>
              `;
            }
          } else if (!token) {
            borrowSection = `
              <p style="margin-top:1.2rem;color:var(--gray);">
                <a href="login.html" style="color:var(--gold);font-weight:500;">Login</a> to borrow this book.
              </p>
            `;
          }

          container.innerHTML = `
            <div class="book-detail">
              <div class="book-cover">
                <img src="https://via.placeholder.com/300x400?text=No+Cover" alt="${currentBook.title}">
              </div>
              <div class="book-info">
                <h1>${currentBook.title}</h1>
                <p class="author">by ${currentBook.author || "Unknown"}</p>
                <div class="meta">
                  <span><strong>Category:</strong> ${currentBook.category || "N/A"}</span>
                  <span><strong>ISBN:</strong> ${currentBook.isbn || "N/A"}</span>
                  <span id="copiesDisplay"><strong>Copies:</strong> ${copies}</span>
                </div>
                <div class="availability ${isAvailable ? "available" : "unavailable"}" id="availabilityDisplay">
                  ${isAvailable ? "&#10003; Available (" + copies + " copies)" : "&#10007; Currently Unavailable"}
                </div>
                <p class="description">${currentBook.description || "No description available."}</p>
                <div id="borrowMessage" class="message" style="margin-top:1rem;display:none;"></div>
                ${borrowSection}
              </div>
            </div>
          `;

          const borrowBtn = document.getElementById("borrowBtn");
          if (!borrowBtn) return;

          borrowBtn.addEventListener("click", async () => {
            const msgEl = document.getElementById("borrowMessage");
            borrowBtn.disabled = true;
            const action = borrowed ? "return" : "borrow";
            borrowBtn.textContent = action === "borrow" ? "Borrowing..." : "Returning...";

            try {
              const result = await apiFetch(`/books/${id}/${action}`, { method: "POST" });
              isBorrowed = !borrowed;
              msgEl.textContent = result.message;
              msgEl.className = "message success";
              msgEl.style.display = "block";
              renderDetail(result.book, isBorrowed);
            } catch (err) {
              borrowBtn.disabled = false;
              borrowBtn.textContent = borrowed ? "&#8617; Return Book" : "&#128218; Borrow Book";
              msgEl.textContent = err.message;
              msgEl.className = "message error";
              msgEl.style.display = "block";
            }
          });
        }

        renderDetail(book, isBorrowed);
      } catch (err) {
        container.innerHTML = `<p style="color:var(--danger);">Failed to load book: ${err.message}</p>`;
      }
    })();
  }

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
