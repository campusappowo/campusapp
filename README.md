# SKIBIDI SIGMA

Yo
Basic work done? Signing up or signing in, gives u a JWT that is stored in the local storage and is used for userid and password validation but who cares itna about privacy amiright

### no work done on what happens if the user gives an invalid input, and im too afraid to find out what happens. we should probably handle those edge cases soon.

HMMM lets see ill try to explain how to run the code, first time writing markdown

#### cd to backend and go node dist/index.js or if u want to be fancy shmancy and do dev i have the nodemon for tsc installed as a dependency just run the command 

```
npx tsc-watch --onSuccess "node ./dist/index.js"
```

#### cd to front and basic
``` npm run dev ``` 

okay so
# BACKEND

there are 3 basic routes
1. /
2. /lmsapi
3. /dbapi
   
### FOR 1 OR "/" ROUTE : 
    Theres a basic /signin and /signup route

    for /signin -> just give a username and password and it will
    return you a JWT. 

    for /signup -> Same give a username and password and it will
    return you a JWT. gotta do the above tasks here too.
    **BUT** WE cant really check if the user exists in the DB
    yet. Gotta Check with the LMS API before getting them to 
    home??

    OHHHHHH MAYBE AN IDEA HIT ME RIGHT NOW
    We could do it like the UIMS app, and if the user
    doesnt exist in the DB, WE could take them to the 
    captcha page, get them verified as in whether they
    exist on the UIMS site or not and based on that we could
    transfer them to the home page!!!


### FOR 2 OR "/lmsapi" ROUTE : 
    WE have 2 routes here a get "/" route and a post "/" route

    But before that we have an authentication middleware:
    This is where the problem arises, Remember just above
    I said that we give them a JWT as soon as they sign up
    without even knowing whether they exist in the UIMS DB or not.
    What I thought was that if we can put the userId and the
    password in the JWT then we wont need to send it everywhere.
    Maybe if we can find a way to transport those then life
    will be easier.

    Middleware 1 : Authentication : 
    Simple, picks up JWT from headers, decodes it, gets id
    and password. Forwards those 2 to other requests.

    Middleware 2 : start Session :
    Create puppeteer session.

    Middleware 3 : GetCaptcha :
    Uses the userId and password from the middleware to
    get the captcha and store it in the fs. Still Need to
    figure out what to do with the Captcha image
    and how to get it to the end user.
    Also stores the session in the localStorage so that
    other request can use it. (Hint : The POST)

    Middleware 4 : SubmitCaptcha :
    USED BY POST. The other 2 were used by GET.
    Figure out how to get the captcha to the end user
    and basically submits the captcha, fetches data, returns
    the user object with uid and name.
    And the timetable object. timetable object kinda fucked at
    the moment i know but we'll deal with that later.
    ALSO
    ********
    IMP
    *****
    This is where we put the user in the DB.If he can successfully
    login we put him in the DB.
    FIND OUT WHAT TO DO IF THE USER ALREADY EXISTS AND
    other shit.? Do something with the JWT if the user doesnt
    exist on the UIMS DB maybe? just throwing out ideas at this
    point.


    GET REQUEST => BASICALLY MIDDLEWARE 1,2,3
    POST REQUEST => BASICALLY MIDDLEWARE 1,4

### FOR 3 or "/dbapi" ROUTE : 

    ONLY 1 ROUTE "/getDetails"
   
    Middleware 1 : Same Verification middleware, get JWT decode it and forward userId and password to the /getDetails request.
   
    /getDetails => Nothing much, gets the data for the user from the DB for the user if they already exist in the DB.

 # FRONTEND

   /signin => signin form, return JWT on signin uses ":3000/signin"
   
   /signup => signup form, return JWT on signup uses ":3000/signup" fix this route..
   
   /home => Fetches data from /dbapi if user exists, otherwise
   fetches data from /lmsapi and stored in the db. Also houses
   the captcha element at the moment. If this is the first time
   the user is logging in he will need to enter a captcha to get access to his details
   Also need a way to allow existing users to click on a refresh button which will
   prompt them with a captcha input and let them refetch fresh data from uims instead
   of the DB or (hopefully redis if we can implement it later.)


# BIG TODOS:
1. CAPTCHA CONVEYED TO FRONTEND
2. SIGNUP COMPONENT FIX
3. HANDLE WRONG LOGINS AND STUFF
4. STATE MANAGEMENT, RECOIL OR REDUX? OR DO WE JUST
RAWDOG IT. AS IN NO STATE MANAGEMENT. EVENTUALLY
GOTTA DO IT.
5. REDIS
6. ADD MORE TODOS
