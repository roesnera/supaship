// init supabase client

const { createClient } = supabase;

const supaUrl = "https://vqdbmoachapvmzglloqn.supabase.co";
const supaAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGJtb2FjaGFwdm16Z2xsb3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIxOTU0OTgsImV4cCI6MTk5Nzc3MTQ5OH0.GjC8C4MBbVWbbLm3_yl2Yj3evIrXvZ3OfXltAX-3JLU";

const supaClient = createClient(supaUrl, supaAnonKey);

// html elements
const loginButton = document.getElementById("signInBtn");
const logoutButton = document.getElementById("signOutBtn");
const whenSignedIn = document.getElementById("whenSignedIn");
const whenSignedOut = document.getElementById("whenSignedOut");
const userDetails = document.getElementById("userDetails");
const myThingsSection = document.getElementById("myThings");
const myThingsList = document.getElementById("myThingsList");
const allThingsSection = document.getElementById("allThings");
const allThingsList = document.getElementById("allThingsList");
const creatething = document.getElementById("createThing");

// Event Listeners

console.log('script running');

loginButton.addEventListener("click", () => {
    supaClient.auth.signInWithOAuth({
        provider: "google",
    });
});

logoutButton.addEventListener("click", () => {
   supaClient.auth.signOut();
});

// init

checkUserOnStartup();
const allThings = {};
getAllInitialThings();

supaClient.auth.onAuthStateChange((_event, session) => {
    if(session?.user){
        adjustForUser(session.user);
    } else {
        adjustForNoUser();
    }
})

// function declarations

async function checkUserOnStartup() {
    const {
        data: { user },
    } = await supaClient.auth.getUser();
    user ? adjustForUser(user): adjustForNoUser();
}

function adjustForUser(user) {
    whenSignedIn.hidden = false;
    whenSignedOut.hidden = true;
    myThingsSection.hidden = false;
    userDetails.innerHTML = `
    <h3>Hi ${user.user_metadata.full_name}</h3>
    <img src="${user.user_metadata.avatar_url}" />
    <p>UID: ${user.id}</p>`
}

function adjustForNoUser() {
    whenSignedIn.hidden = true;
    whenSignedOut.hidden = false;
    myThingsSection.hidden = true;
}

async function getAllInitialThings() {
    const { data } = await supaClient.from("things").select();
    for (const thing of data) {
        allThings[thing.id] = thing;

    }
    renderAllThings();
}

function renderAllThings() {
    const tableHeader = `
    <thead>
        <tr>
            <th>Name</th>
            <th>Weight</th>
        </tr>
    </thead>`;
    const tableBody = Object.values(allThings)
    .sort((a,b) => {
        a.weight > b.weight ? -1:1;
    })
    .map((thing) => {
        return `
        <tr>
            <td>${thing.name}</td>
            <td>${thing.weight}</td>
        </tr>`
    })
    .join("");
    const table = `
    <table class="table table-striped">
        ${tableHeader}
        <tbody>
            ${tableBody}
        </tbody>
    </table>`;
    allThingsList.innerHTML = table;
}