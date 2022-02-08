# Areca Peel Tech App

This app is developed using node.js, express.js and sequelize.

The screenshots of UI of this app is attached below:

![ArecaPeelTech-imgs1](https://user-images.githubusercontent.com/58632626/152818654-d070cc2c-c20d-48e5-a82e-8b938edae146.png)
This is the home page. A click on the page or a press of enter key will take you into the login page. User name and password are verified there.

![ArecaPeelTech-imgs2](https://user-images.githubusercontent.com/58632626/152818685-11a05965-4fdb-4a90-a9f4-4246fcbc029f.png)
This page has two buttons: Goods Received and Transactions
‘Goods Received’ button is used to enter the details of the customer whereas ‘Transactions’ button is used to see the previous transactions.

![ArecaPeelTech-imgs3](https://user-images.githubusercontent.com/58632626/152818715-45f8c337-2171-4ab4-a888-c6a4ab587467.png)
When Goods Received button is pressed you will see the customer information entering page. After entering all the required details 'Submit' button is pressed.
This will store the data in the databse which can be fetched when needed.

![ArecaPeelTech-imgs9](https://user-images.githubusercontent.com/58632626/152818934-971c5e82-cffc-4510-aa3d-0108dcb81a4b.png)
This is 'Transactions' page. You can see all, recent as well as previous transactions. If received goods is not returned after processing, the status will be 'Not Returned'. While returning, the details of the processed goods and other required data can be uploaded to the database. For that click 'Upload' button.

![ArecaPeelTech-imgs5](https://user-images.githubusercontent.com/58632626/152818786-4a49addb-a3fb-4968-9e7d-09284ba0e483.png)
This is 'Goods Returned' page where one can enter returning, processed goods details.

![ArecaPeelTech-imgs6](https://user-images.githubusercontent.com/58632626/152818813-b9a0a1aa-903d-4920-8df8-24a20af353f9.png)
Once the returning goods details are submitted, it will be stored in the database and the status in the 'Transactions' page will become 'Returned' and the 'Upload' button will become 'Invoice'.

![ArecaPeelTech-imgs7](https://user-images.githubusercontent.com/58632626/152818874-367942f5-e6b6-4277-b2f8-54121a231b2a.png)
When 'Invoice' button is clicked, it will take you to the invoice page which can be printed if needed.

![ArecaPeelTech-imgs8](https://user-images.githubusercontent.com/58632626/152818906-3a6872ca-ce64-4e26-8574-39837a9d1987.png)
When 'Print Invoice' button is clicked, it will show print preveiw. You can take the printout from here.
