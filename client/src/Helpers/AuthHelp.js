
// const url = "https://art-selling-website.onrender.com";
const url = "http://localhost:8000";
async function Autho() {
  try {
    const response = await fetch(`${url}/auth`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    if (data.message === "Unauthorized") {
      // Return null instead of redirecting - allows pages to be accessed without login
      return null;
    }
    return data;
  } catch (err) {
    // Return null instead of redirecting - allows pages to be accessed without login
    console.log("User not authenticated - continuing without login");
    return null;
  }
}

export default Autho;