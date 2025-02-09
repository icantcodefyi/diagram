Generate diagrams with gemini :3

we use mermaid to genreate diagram, testing the abilities of latest gemini models 

basically once a user tries to generate we first check wether can a diagram even be generated from the prompt if not then nahhh 

if yes we find out what type of diagram will suit the user best from the 20 types of diagram we can generate

then we use the docs of that specific diagram and give it as context to the ai and make him generate the code and then validate the code 

validation on backend is tuf because mermaid is client side so we use puppeteer and validate the diagram 

finally sending the response to frontend :)
