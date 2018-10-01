# Lab

[Images Not Loading?](./Lab.pdf)

For the Lab we will create a network of a Meetup. This is not in any way a business use case. But todays lab will demonstrate the features of composer. It will all be done on the browser. That means no setup is necessary on your local machine. 

https://composer-playground.mybluemix.net/editor


- Go to the URL Above. 
- Click on Lets Blockchain.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538259836164_image.png)

- Click on Deploy New Business Network
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538259887855_image.png)

- Select `empty-business-network` and give the network a name. I am calling mine `meetup-network` 
- Give the name of admin card. I am calling it `admin@meetup-network` 
- Click Deploy


![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538260092781_image.png)

- Click Connect Now
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538260125919_image.png)

- Go to Model File Tab
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538322240096_image.png)


Here we will make changes. 
In line 15 change the namespace to your namespace. I am calling it `org.meetup.ibmcode`. All other objects in the model file will be part of this namespace. 

In our meetup we do two kinds of things. We have pizzas and we gain knowledge. These are out assets. We have two kind of participants, audience and instructor. And we have two kinds of transactions, Eat and Learn. 

Lets work on the eat transaction first. 

First we create the Pizza asset. Add the following to model file.

    asset Pizza identified by id {
        o String id  
        o Integer amount
    }

We just created an asset called pizza. It will be identified by its id. It has another field called amount. 

Then we create the Audience Participant. 

    abstract participant Member identified by id {
        o String id
        o PresenceState state
        --> Knowledge[] topics
    }
    
    participant Audience extends Member {
        o FullState full
    }

Notice the `abstract` participant. This is because the instructor and audience share a super class member. Also you can see couple of unknown types such as `PresenceState` and `FullState` . These are couple of enums. Add them toward the top of the file.


    enum PresenceState {
        o PRESENT
        o ABSENT
    }
    
    enum FullState {
        o STARVING
        o HUNGRY
        o FULL
    }

We also need to add `Knowledge` asset.

    asset Knowledge identified by id {
        o String id
        o String name
    }

Finally we add the eat transaction.

    transaction Eat {
        --> Audience member
        --> Pizza food
    }

We see the `- - >` symbol. This just denotes that `member` and `food` are relationships and not owned by the transactions.

Its now time to work on the logic of the transaction.

- Click on `Add a file…` in the left pane toward the bottom.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538323257201_image.png)

- Select `Script File (.js)`
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538323316795_image.png)

- Now we can edit this file.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538323373184_image.png)


Add the following in script.js file.

    /**
     * @param {org.meetup.ibmcode.Eat} eat - the eat transaction
     * @transaction
     */

This format of comment needs to be there before any transaction function. This tells the Js function which resource it gets passed when it is called. Notice the namespace name. It should match your namespace name. 

Right after the comments above add the function. The name of the function or the variable passed does not matter. We could call it whatever we want. But they will connect to our model via the `@param` tag. 


    async function eat(eat) {
      let member = eat.member;
      
      let willEat = 0;
      
      if(member.state !== 'PRESENT') {
        throw new Error ('Not Present Members can not eat');
      }
     
      
      if (member.full === 'STARVING') {
        willEat = 2;
      } else if(member.full === 'HUNGRY') {
        willEat = 1;
      } else {
        willEat = 0;
      }
      
      
      let food = eat.food;
      if (food.amount < willEat) {
        throw new Error ('Not Enough Food');
      }
      
      food.amount = food.amount - willEat;
      member.full = 'FULL';
      
      const foodRegistry = await getAssetRegistry('org.meetup.ibmcode.Pizza');
      await foodRegistry.update(food);
      
      const memberRegistry = await getParticipantRegistry('org.meetup.ibmcode.Audience');
      await memberRegistry.update(member);
    }

In the code all we are doing is checking if our audience can eat some pizza. 
There is logic to check if they are present to the meetup also if there is enough food. After the transaction the member should be full and number of pizzas left should decrease. We update it in the end using `getAssetRegistry` and `getParticipantRegistry` 

Now that everything looks good. (No errors)

- Click `Deploy Changes`
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538325101133_image.png)

- Go to `Test` tab. You should see the following screen.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538325192148_image.png)

- Create a new participant
    {
      "$class": "org.meetup.ibmcode.Audience",
      "full": "STARVING",
      "id": "1",
      "state": "PRESENT",
      "topics": []
    }
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538360661032_image.png)

- Create a Pizza Asset
    {
      "$class": "org.meetup.ibmcode.Pizza",
      "id": "1",
      "amount": 0
    }
- Click on submit transaction.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538360763439_image.png)

- Submit the transaction. Member is set to audience id#1 and pizza #1
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538360810956_image.png)

- You should see an error. (Not Enough Food)
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538360844470_image.png)

- Lets go update our pizza asset. Click on the pen on the asset.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538361059794_image.png)

- Update the amount to 5 (Or any number really)
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538361126099_image.png)

- Go Back and submit the transaction again.
- It was a success this time. We can see our pizza asset updated as per our logic.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538361225298_image.png)

- Go to All transactions. 
- You can see all our changes logged. 

 

![](https://d2mxuefqeaa7sj.cloudfront.net/s_36A1A6882F2E629D67905CBD09A811EC3D38022D79E9284B375A8F8CCF9D7462_1538361287484_image.png)

- Our Update is also a transaction. This is the ledger and is immutable.

We can add another transaction to this. Complete code is attached in the repo. Look at [lib/script.js](./lib/script.js) and [model/model.cto](./model/model.cto) for the complete code. 

[Next Steps](./Next-Steps.md)