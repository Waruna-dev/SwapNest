const payload = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe." + Date.now() + "@example.com",
  phone: "1234567890",
  nic: "900000000V",
  dob: "2000-01-01T00:00:00.000Z",
  password: "Password123!@#",
  role: "volunteer"
};

fetch("http://localhost:5000/api/volunteers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
.then(async res => {
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
})
.catch(err => console.error(err));
