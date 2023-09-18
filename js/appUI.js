//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
const categories = []; 
let categorieSelec = null;
Init_UI();


function Init_UI() {
    renderBookmarks();
    
    $('#createContact').on("click", async function () {
        saveContentScrollPosition();
        renderCreateContactForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
        renderCategorie();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    
    });
   // $("#categories2").append(renderCategorie());
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire des favoris</h2>
                <hr>
                <p>
                    Petite application de gestion des favoris à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: 
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favois");
    $("#createContact").show();
    $("#abort").hide();
    
    let bookmarks = await Contacts_API.Get();
    
    eraseContent();
    eraseCategorie();
    
    if (bookmarks !== null) {
        
        bookmarks.forEach(bookmark => {

            if(categorieSelec == null)
            {
                $("#content").append(renderBookmark(bookmark));
            }
            else if(bookmark.categorie === categorieSelec)
            {
                console.log(categorieSelec);

                
                $("#content").append(renderBookmark(bookmark));
            }

            
           // const uniqueCategories = new Set(); // Créez un ensemble pour stocker les catégories uniques
            $("#categories").append(renderCategorie(bookmark));
            
        });
      
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editContactId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteContactForm(parseInt($(this).attr("deleteContactId")));
        });
        $(".contactRow").on("click", function (e) { window.location = $(this.find("#bookmarkurl").val()) })
        


        
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function eraseCategorie()
{
  $("#categories").empty();
  categories.length = 0;
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateContactForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let contact = await Contacts_API.Get(id);
    if (contact !== null)
        renderBookmarkForm(contact);
    else
        renderError("Contact introuvable!");
}
async function renderDeleteContactForm(id) {
    showWaitingGif();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await Contacts_API.Get(id);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="contactdeleteForm">
            <h4>Effacer le contact suivant?</h4>
            <br>
            <div class="contactRow" contact_id=${bookmark.Id}">
                <div class="contactContainer">
                    <div class="contactLayout">
                        <div class="bookmarkTitre">${bookmark.Titre}</div>
                        
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteContact').on("click", async function () {
            showWaitingGif();
            let result = await Contacts_API.Delete(bookmark.Id);
            if (result){
                renderCategorie();
                renderBookmarks();
            }
         
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
            renderCategorie();
        });
       
    } else {
        renderError("Contact introuvable!");
    }
}
function newContact() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Titre = "";
    bookmark.url = "";
    bookmark.categorie = "";
    return bookmark;
}
function renderBookmarkForm(bookmark = null) {
    $("#createContact").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    var urlLogo;
    if(create){
        urlLogo = "https://cdn-icons-png.flaticon.com/512/865/865288.png";
    } 
    else{ 
        urlLogo="https://www.google.com/s2/favicons?domain="+bookmark.url+"&sz=64";
    }
    if (create) bookmark = newContact();

   

    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
    
        <form class="form" id="contactForm">
        <img src=${urlLogo} alt="" width ="75" height ="75" id="image">
        <br>
            <input type="hidden" name="Id" value="${bookmark.Id}"/>
            

            <label for="Titre" class="form-label">Titre</label>
            <input 
                class="form-control Alpha"
                name="Titre" 
                id="Titre" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un Titre"
                InvalidMessage="Le nom comporte un caractère illégal" 
                value="${bookmark.Titre}"
            />
            <label for="URL" class="form-label">URL </label>
            <input
                class="form-control Url"
                name="url"
                id="url"
                placeholder="url"
                required
                RequireMessage="Veuillez entrer votre url" 
                InvalidMessage="Veuillez entrer un url valide"
                value="${bookmark.url}"
                urlLogo = ${bookmark.url}+"/favicon.ico";

            />
            <label for="Catégorie" class="form-label">Catégorie </label>
            <input 
                class="form-control"
                name="categorie"
                id="categorie"
                placeholder="categorie"
                required
                RequireMessage="Veuillez entrer une categorie " 
                InvalidMessage="Veuillez entrer une categorie valide"
                value="${bookmark.categorie}"
                
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
   
    $('#url').on("change", async function () {

        var saisie =document.getElementById("url").value;
        if(saisie != null && saisie != "" )
        {
            urlLogo ="https://www.google.com/s2/favicons?domain="+saisie+"&sz=64";
            $('#image').attr("src",urlLogo);
        }
        else
        {
            urlLogo = "https://cdn-icons-png.flaticon.com/512/865/865288.png";
            $('#image').attr("src",urlLogo);
        }
    });
   

    //var saisie =document.getElementById("url").value;
    //if(saisie != null )
    //{ urlLogo="https://www.google.com/s2/favicons?domain="+saisie+"&sz=20";

    //}
   
    initFormValidation();
    $('#contactForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#contactForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await Contacts_API.Save(bookmark, create);
        if (result){
            renderBookmarks();
            renderCategorie();}
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(bookmark) {
    
    
//var urlLogo = bookmark.url+"/favicon.ico";
 urlLogo="https://www.google.com/s2/favicons?domain="+bookmark.url+"&sz=20";
 

    return $(`
     <div class="contactRow" contact_id=${bookmark.Id}">
        <div class="contactContainer noselect">
        
            <div class="contactLayout">
             <input type= "hidden" value= "${bookmark.url}" id="bookmarkurl">
                
                <span class="bookmarkTitre"><img src=${urlLogo} alt="Description de l'image" width ="20" height ="20"> ${bookmark.Titre}</span>
                
                <span class="bookmarkCategorie"> ${bookmark.categorie}
                 <a href="${bookmark.url}" >  </a>
                </span>
               
               
            </div>
            <div class="contactCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editContactId="${bookmark.Id}" title="Modifier ${bookmark.Titre}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteContactId="${bookmark.Id}" title="Effacer ${bookmark.Titre}"></span>
            </div>
        </div>
    </div>           
    `);
}
function renderCategorie(bookmark)
{ 
  const categorieElements = document.querySelectorAll(".category");
  categorieElements.forEach(element => {
    element.addEventListener("click", function () {
       
        const categorieValue = element.querySelector("#select").getAttribute("value");
        //categorieValue = $(this).text().trim();
        
        if(categorieValue == "tout")
        {
            categorieSelec = null;
            

        }
        else{
            if(categorieValue == "Jeux"){
                categorieSelec = "Jeux Vidéo";
            }
            else{
                categorieSelec = categorieValue;

            }
            
        }

         categorieElements.forEach(otherElement => {
            const icone = otherElement.querySelector("#select");
            icone.classList.remove("fa-check");
            icone.classList.add("fa-fw");
            
            renderBookmarks();
        });
    
        
        const icone = element.querySelector("#select");
        icone.classList.remove("fa-fw");
        icone.classList.add("fa-check");
        
        


    });
});

 if (!categories.includes(bookmark.categorie)) {
    categories.push(bookmark.categorie);
    return(`
    <div class="dropdown-item menuItemLayout category" id="allCatCmd">
        <i class="menuIcon fa fa-fw mx-2" id="select" value=${bookmark.categorie}></i>${bookmark.categorie}
    </div>
   `);
   

}
 
 
}