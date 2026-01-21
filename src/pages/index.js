import {
  enableValidation,
  resetValidation,
  disableButton,
  settings
} from "../scripts/validation.js";
import "./index.css";
import Api from "../utils/Api.js";
import { setButtonText, handleSubmit } from "../utils/helpers.js";



let userId;
let selectedCard;
let selectedCardId;


const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "0461ebba-52ef-4397-be31-2948ded8a002",
    "Content-Type": "application/json",
  },
});


const profileEditButton = document.querySelector(".profile__edit-button");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar img");
const profileEditAvatar = document.querySelector(".profile__avatar-button");
const editProfileModal = document.querySelector("#edit-profile-modal");


const inputName = document.querySelector("#profile-name-input");
const inputDescription = document.querySelector("#profile-description-input");
const profileFormElement = editProfileModal.querySelector(".modal__form");
const profileForm = document.forms["profile-form"];
const profileAvatarModal = document.querySelector("#edit-avatar-modal");
const avatarForm = document.forms["avatar-form"];
const avatarInput = document.querySelector("#profile-picture-input"); 


const newPostButton = document.querySelector(".profile__add-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = document.forms["newPost-form"];
const newPostLinkInput = document.querySelector("#newPost-link-input");
const newPostCaptionInput = document.querySelector("#newPost-caption-input");

const cardSubmitButton = newPostModal.querySelector(".modal__submit-button");
const deletePostModal = document.querySelector("#delete-post-modal");
const closeButtons = document.querySelectorAll(".modal__close");


const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");


const modals = document.querySelectorAll(".modal");


const cardTemplate = document.querySelector("#card-template");
const cardList = document.querySelector(".cards__list");

const deleteCardSubmit = deletePostModal.querySelector(".modal__delete-button");
const deleteCardCancel = deletePostModal.querySelector(".modal__cancel-button");



modals.forEach((modal) => {
  closeModalOnOutsideClick(modal);
});


closeButtons.forEach((button) => {
  const modal = button.closest(".modal");
  button.addEventListener("click", () => closeModal(modal));
});


function openModal(modal) {
  modal.classList.add("modal_opened");

  document.addEventListener("keydown", closeModalOnEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
 
  document.removeEventListener("keydown", closeModalOnEscape);
}


function closeModalOnOutsideClick(modal) {
  modal.addEventListener("click", (evt) => {
   
    if (evt.target === modal) {
      closeModal(modal);
    }
  });
}


function closeModalOnEscape(evt) {
  if (evt.key === "Escape") {
    
    const openModal = document.querySelector(".modal_opened");
    if (openModal) {
      closeModal(openModal);
    }
  }
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");

  const isLiked = data.isLiked;
  if (isLiked) {
    cardLikeButton.classList.add("card__like-button_clicked");
  }

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardLikeButton.addEventListener("click", (evt) => {
    handleLike(evt, data._id);
  });

 
  cardDeleteButton.addEventListener("click", (evt) => {
    handleDeleteCard(cardElement, data);
  });

 
  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalCaption.textContent = data.name;
    previewModalImageEl.src = data.link;
    previewModalCaption.alt = data.name;
  });

  return cardElement;
}

function renderCard(item, method = "append") {
  const cardElement = getCardElement(item);
  cardList[method](cardElement);
}

function handleAvatarFormSubmit(evt) {
  function makeRequest() {
    return api.editAvatar({ avatar: avatarInput.value }).then((data) => {
      profileAvatar.src = data.avatar;
      profileAvatar.alt = data.name;
      closeModal(profileAvatarModal);
    });
  }

  handleSubmit(makeRequest, evt, "Saving...");
}

function handleNewPostSubmit(evt) {
  function makeRequest() {
    return api
      .newCardPost({
        link: newPostLinkInput.value,
        name: newPostCaptionInput.value,
      })
      .then((data) => {
        renderCard(data, "prepend");
        disableButton(cardSubmitButton, settings);
        closeModal(newPostModal);
      });
  }

  handleSubmit(makeRequest, evt, "Saving...");
}

function handleLike(evt, cardId) {
  const likeButton = evt.target;
  const isLiked = likeButton.classList.contains("card__like-button_clicked");

  api
    .handleLike({ cardId: cardId, isLiked: isLiked })
    .then((updatedCard) => {
      if (updatedCard.isLiked) {
        likeButton.classList.add("card__like-button_clicked");
      } else {
        likeButton.classList.remove("card__like-button_clicked");
      }
    })
    .catch(console.error);
}

function handleProfileFormSubmit(evt) {
  function makeRequest() {
    return api
      .editUserInfo({ name: inputName.value, about: inputDescription.value })
      .then((userData) => {
        profileName.textContent = userData.name;
        profileDescription.textContent = userData.about;
        closeModal(editProfileModal);
      });
  }
  handleSubmit(makeRequest, evt, "Saving...");
}

function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data._id;
  console.log("Selected Card ID:", selectedCardId);
  openModal(deletePostModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.target;
  setButtonText(submitBtn, true, "Delete", "Deleting...");
  api
    .deleteCard({ cardId: selectedCardId })
    .then(() => {
      selectedCard.remove();
      closeModal(deletePostModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Delete", "Deleting...");
    });
}

profileEditButton.addEventListener("click", () => {
  inputName.value = profileName.textContent;
  inputDescription.value = profileDescription.textContent;
  resetValidation(editProfileModal, [inputName, inputDescription], settings);
  openModal(editProfileModal);
});

newPostButton.addEventListener("click", () => {
  openModal(newPostModal);
});

profileEditAvatar.addEventListener("click", () => {
  openModal(profileAvatarModal);
});

profileForm.addEventListener("submit", handleProfileFormSubmit);
newPostForm.addEventListener("submit", handleNewPostSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

deleteCardSubmit.addEventListener("click", handleDeleteSubmit);

deleteCardCancel.addEventListener("click", () => closeModal(deletePostModal));

api
  .getAppInfo()
  .then(([cards, userData]) => {
    profileName.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.src = userData.avatar;
    profileAvatar.alt = userData.name;
    userId = userData._id;
    cards.reverse().forEach((card) => {
      renderCard(card);
    });
  })
  .catch(console.error);

enableValidation(settings);
