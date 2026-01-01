// backend/scripts/generatePostmanCollection.ts
import fs from "fs";
import { Postman } from "postman-collection";
import { specs } from "../src/config/swagger";

// Convert OpenAPI to Postman collection
function generatePostmanCollection() {
  try {
    const postmanCollection = new Postman.Collection({
      info: {
        name: "AI for Health API",
        schema:
          "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        description: "Postman collection for AI for Health API",
      },
      variable: [
        {
          key: "baseUrl",
          value: "http://localhost:3000/api",
          type: "string",
        },
      ],
    });

    // Add authentication request
    const authRequest = new Postman.Request({
      method: "POST",
      header: [
        {
          key: "Content-Type",
          value: "application/json",
        },
      ],
      url: "{{baseUrl}}/auth/login",
      body: {
        mode: "raw",
        raw: JSON.stringify({
          email: "user@example.com",
          password: "yourpassword",
        }),
      },
    });

    postmanCollection.items.add({
      name: "Authentication",
      request: authRequest,
    });

    // Add other endpoints from OpenAPI specs
    if (specs.paths) {
      Object.entries(specs.paths).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, endpoint]: [string, any]) => {
          const request = new Postman.Request({
            method: method.toUpperCase(),
            header: [
              {
                key: "Authorization",
                value: "Bearer {{auth_token}}",
              },
              {
                key: "Content-Type",
                value: "application/json",
              },
            ],
            url: `{{baseUrl}}${path}`,
          });

          if (method === "post" || method === "put") {
            request.body = {
              mode: "raw",
              raw: "{}", // Placeholder for request body
            };
          }

          postmanCollection.items.add({
            name: endpoint.summary || path,
            request,
          });
        });
      });
    }

    // Save to file
    const collectionPath = "./postman/ai-for-health.postman_collection.json";
    fs.mkdirSync("./postman", { recursive: true });
    fs.writeFileSync(
      collectionPath,
      JSON.stringify(postmanCollection, null, 2)
    );

    console.log(`Postman collection generated at ${collectionPath}`);
  } catch (error) {
    console.error("Error generating Postman collection:", error);
  }
}

generatePostmanCollection();
