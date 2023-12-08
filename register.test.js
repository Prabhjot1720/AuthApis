import { register } from "./controllers/Authentication.js";

test("to get username or email and register in DB", () => {
    expect(register({
        body: {
            username: "testUsername",
            email: "testEmail",
            password:"password"
        }
    }))
})