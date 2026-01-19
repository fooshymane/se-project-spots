export function setButtonText(
  btn,
  isLoading,
  defaultText = "Save",
  loadingText = "Saving..."
) {
  if (isLoading) {
    btn.textContent = loadingText;
  } else {
    btn.textContent = defaultText;
  }
}


export function handleSubmit(request, evt, loadingText = "Saving...") {
  
  evt.preventDefault();


  const submitButton = evt.submitter;
  
  const initialText = submitButton.textContent;
  
  setButtonText(submitButton, true, initialText, loadingText);
 
  request()
    .then(() => {
   
      evt.target.reset();
    })
  
    .catch(console.error)

    
    .finally(() => {
      setButtonText(submitButton, false, initialText, loadingText);
    });
}