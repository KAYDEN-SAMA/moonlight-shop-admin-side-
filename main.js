import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, get, set, push } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyALwp27GSd6oQ4e18Uql4o-EDANgVmtbms",
  authDomain: "moonlight-project-b058f.firebaseapp.com",
  databaseURL: "https://moonlight-project-b058f-default-rtdb.firebaseio.com",
  projectId: "moonlight-project-b058f",
  storageBucket: "moonlight-project-b058f.appspot.com",
  messagingSenderId: "872347634357",
  appId: "1:872347634357:web:3ea2750d0d734d70e20cfc"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const errorParagraph = document.getElementById("errorParagraph");
const loginButton = document.getElementById("loginButton");
const showPasswordCheckbox = document.getElementById("showPassword");
const loginForm = document.getElementById("LoginForm");
const dataSection = document.getElementById("dataSection");

onAuthStateChanged(auth, user => {
  if (user) {
    loginForm.style.display = "none";
    dataSection.style.display = "block";
    loadUserData(user);
  } else {
    loginForm.style.display = "block";
    dataSection.style.display = "none";
  }
});

function loadUserData(user) {
  const adminUid = user.uid;
  get(ref(db, `admins/${adminUid}`)).then(adminSnapshot => {
    if (adminSnapshot.exists()) {
      const data = adminSnapshot.val();
      if(data.isAllowed === true){
        loadOfferData();
      }
    }
  });
}

function loadOfferData() {
  const header = document.getElementById("header");
  const addOfferDiv = document.getElementById("addOfferDiv");
  get(ref(db, `shop`)).then(offersSnapchot => {
    if (offersSnapchot.exists()) {
      dataSection.innerHTML = "";
      addOfferDiv.innerHTML = "";

      const addOfferBtn = document.createElement('i');

      addOfferBtn.className = "fa-sharp fa-solid fa-plus";
      addOfferBtn.id = 'addOfferBtn';

      addOfferDiv.appendChild(addOfferBtn);
      header.appendChild(addOfferDiv);

      addOfferBtn.addEventListener('click', () => {
  const dialog = document.createElement('div');
  dialog.innerHTML = `<div class="dialog">
    <label for="title">العنوان:</label>
    <input type="text" id="title" placeholder="العنوان" maxlength="12">
    <label for="">الوصف:</label>
    <input type="text" id="description" placeholder="الوصف" maxlength="50">
    <label for="price">السعر:</label>
    <input type="number" id="price" placeholder="السعر">
    <label for="cover">رفع الصورة:</label>
    <input type="file" id="coverInput" accept="image/*">
    <img id="coverPreview" style="display: none; max-width: 100%;" alt="Cover Preview">
    <p id="errorElm"></p>
    <div class="buttons-div">
      <button id="confirmBtn">تأكيد</button>
      <button id="cancelBtn">إلغاء</button>
    </div>
  </div>`;
  
document.body.appendChild(dialog);
document.body.classList.add('modal-open');

const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');
const coverInput = document.getElementById('coverInput');
const coverPreview = document.getElementById('coverPreview');
const errorElm = document.getElementById('errorElm');

coverInput.addEventListener('change', function(event) {
  coverPreview.style.display = "block";
  const coverImageFile = event.target.files[0];
  if (coverImageFile && coverImageFile.type.match('image.*')) {
    const reader = new FileReader();
    reader.onload = function(e) {
      coverPreview.src = e.target.result;
    };
    reader.readAsDataURL(coverImageFile);
  } else {
    errorElm.textContent = "يرجى اختيار صورة للغلاف";
    coverPreview.style.display = "none";
  }
});
  confirmBtn.addEventListener('click', async () => {
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const priceInput = document.getElementById('price');

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const price = priceInput.value.trim();

    if (title === "" || description === "" || price === "") {
      errorElm.textContent = "إملأ كل الحقول المطلوبة";
      return;
    }

    if (!coverInput.files[0]) {
      errorElm.textContent = "يرجى اختيار صورة للغلاف";
      return;
    }

    try {
      const imgbbApiKey = '2728c1bfd377ac29cd56a5f3caf0ea31';
      const imageUrl = await uploadImage(imgbbApiKey, coverInput.files[0]);
      const newOfferRef = ref(db, `shop/${title}`);
      set(newOfferRef, {
        title: title,
        description: description,
        price: price,
        cover: imageUrl,
      }).then(() => {
        alert('تم إضافة العرض بنجاح!');
        dialog.remove();
        location.reload();
      }).catch(error => {
        alert('حصل خطأ أثناء إضافة العرض: ' + error.message);
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      errorElm.textContent = "حدث خطأ أثناء رفع الصورة";
    }
  });

  cancelBtn.addEventListener('click', () => {
    dialog.remove();
    document.body.classList.remove('modal-open');
  });

      });
      const offersData = offersSnapchot.val();
      const sortedOfferIds = Object.keys(offersData).sort((a, b) => {
        const valueA = offersData[a].toString();
        const valueB = offersData[b].toString();
        return valueA.localeCompare(valueB, 'ar');
      });
      sortedOfferIds.forEach(offerId => {
        const offerData = offersData[offerId];
        createofferCard(offerId, offerData);
      });
    } else {
        addOfferDiv.innerHTML = "";

      const addOfferBtn = document.createElement('i');

      addOfferBtn.className = "fa-sharp fa-solid fa-plus";
      addOfferBtn.id = 'addOfferBtn';

      addOfferDiv.appendChild(addOfferBtn);
      header.appendChild(addOfferDiv);

      addOfferBtn.addEventListener('click', addNewOffer());
      const offersData = offersSnapchot.val();
      const sortedOfferIds = Object.keys(offersData).sort((a, b) => {
        const valueA = offersData[a].toString();
        const valueB = offersData[b].toString();
        return valueA.localeCompare(valueB, 'ar');
      });
      sortedOfferIds.forEach(offerId => {
        const offerData = offersData[offerId];
        createofferCard(offerId, offerData);
      });
    }
  });
}

async function uploadImage(apiKey, imageFile) {
  const imgbbApiUrl = 'https://api.imgbb.com/1/upload';
  const formData = new FormData();
  formData.append('key', apiKey);
  formData.append('image', imageFile);

  const response = await fetch(imgbbApiUrl, {
    method: 'POST',
    body: formData,
  });

  const json = await response.json();
  if (json.success) {
    return json.data.url;
  } else {
    throw new Error('Image upload failed');
  }
}


function createofferCard(offerId, offerData) {
  const card = document.createElement("div");
  const titleDiv = document.createElement("div");
  const titleTitle = document.createElement("h3");
  const titleEl = document.createElement("p");
  const descriptionDiv = document.createElement("div");
  const descriptionTitle = document.createElement("h3");
  const descriptionEl = document.createElement("p");
  const priceDiv = document.createElement("div");
  const priceTitle = document.createElement("h3");
  const priceEl = document.createElement("p");

  const coverDiv = document.createElement("div");
  const coverTitle = document.createElement("h3");
  const coverEl = document.createElement("p");
  const coverImg = document.createElement("img"); 

  const iconsDiv = document.createElement("div");
  const deleteBtn = document.createElement("i");
  const editBtn = document.createElement("i");

  card.className = "offer-card";
  titleEl.className = "offer-title";
  descriptionEl.className = "offer-description";
  priceEl.className = "offer-price";
  coverDiv.className = "cover-div"
  deleteBtn.className = "fa-solid fa-trash";
  editBtn.className = "fa-solid fa-pen";

  titleTitle.textContent = "العنوان: ";
  titleEl.textContent = offerData.title;
  descriptionTitle.textContent = "الوصف: ";
  descriptionEl.textContent = offerData.description;


  priceTitle.textContent = "السعر: ";
  priceEl.textContent = offerData.price;



  coverTitle.textContent =  "الصورة:";
  coverEl.textContent = offerData.cover;
  coverImg.src = offerData.cover;

  deleteBtn.onclick = function() {
    if (confirm("متأكد من حذف هذا العرض؟")) {
      const offerRef = ref(db, `shop/${offerId}`);
      set(offerRef, null)
        .then(() => {
          alert('لقد تم حذف العرض بنجاح')
          card.remove();
        })
        .catch(error => {
          alert('حصل خطأ أثناء الحذف: ', error);
        });
    }
  };
  let isEditable = false;
  editBtn.addEventListener('click', () => {
    let secondPriceValue;
    if (!isEditable) {
      titleEl.contentEditable = true;
      descriptionEl.contentEditable = true;
      priceEl.contentEditable = true;
      coverEl.contentEditable = true;
      editBtn.className = "fa-solid fa-floppy-disk";
      isEditable = true;
    } else {
      const priceValue = parseFloat(priceEl.textContent);
      set(ref(db, `shop/${offerId}`), {
        title: titleEl.textContent,
        description: descriptionEl.textContent,
        price: priceValue,
        cover: coverEl.textContent,
      });
      titleEl.contentEditable = false;
      descriptionEl.contentEditable = false;
      priceEl.contentEditable = false;
      coverEl.contentEditable = false;
      editBtn.className = "fa-solid fa-pen";
      isEditable = false;
    }
  });
  titleDiv.appendChild(titleTitle);
  titleDiv.appendChild(titleEl);
  descriptionDiv.appendChild(descriptionTitle);
  descriptionDiv.appendChild(descriptionEl);
  priceDiv.appendChild(priceTitle);
  priceDiv.appendChild(priceEl);
  coverDiv.appendChild(coverTitle);
  coverDiv.appendChild(coverEl)
  coverDiv.appendChild(coverImg);
  iconsDiv.appendChild(deleteBtn);
  iconsDiv.appendChild(editBtn);
  card.appendChild(titleDiv);
  card.appendChild(descriptionDiv);
  card.appendChild(priceDiv);
  card.appendChild(coverDiv);
  card.appendChild(iconsDiv);
  dataSection.appendChild(card);
}

showPasswordCheckbox.addEventListener('change', function() {
  passwordInput.type = this.checked ? "text" : "password";
});

loginButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (email === "" || password === "") {
    errorParagraph.style.display = "block";
    errorParagraph.textContent = "أدخل البريد الإلكتروني و كلمة المرور معا!";
    return;
  }

  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    errorParagraph.style.display = "block";
    errorParagraph.textContent = error.message;
  }
});