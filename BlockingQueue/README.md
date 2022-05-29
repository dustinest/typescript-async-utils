# Install

```
$ npm install typescript-blocking-queue --save
```
or
```
$ yarn add typescript-blocking-queue
```
[Direct link to npmjs.com](https://www.npmjs.com/package/typescript-blocking-queue)

# The problem

Sometimes there is a need to execute things through bottleneck. For instance, in case of authentication you would like to be sure all calls are authenticated and will be blocked until refresh token happens.
Therefore this simple queue comes handy. Just create the queue and start calling the callbacks.

Simple syntax:

```typescript
const queue = newPrioritizedBlockingQueue();
await queue.prioritized().enqueue(async () => {
  /** everything will be executed in the order of the queue **/
})
await queue.whenReady().enqueue(async () => {
  /** When queue above does not have any items to execute then run this **/
})
```
The stuff in 'whenReady' can be run asynchronously in random order depending how long they take to execute but execution itself checks if the prioritized queue is empty.

### wait, there's more
```typescript
const queue = newPrioritizedBlockingQueue(2);
```
Now you have two prioritized queue!
```
await queue.prioritized().enqueue(async () => {})
await queue.prioritized(0).enqueue(async () => {})
```
Will both execute in highest priority!
```
await queue.prioritized(1).enqueue(async () => {})
```
Will be executed when preivous queue is done. So, you can create hierarchy of priorities!

## Let's look closer to the implementations

Let's say all those asynchronous calls use some kind of endpoint which requires authentication. The same place using the same queue
```typescript
const queue = newPrioritizedBlockingQueue(2);
```
```typescript
queue.prioritized(1).enqueue(async () => {
  // check if authentication is done
  if (isAuthenticated) {
    return;
  } else {
    // NB! do not await here, therwise whole queue will be blocked!
    queue.prioritized(0).enqueue(() => {
      // authenticate;
    })
    queue.whenReady().enqueue(() => {
      // I even do not know what you would like to do here, but just in sake of example
    })
  }
});
```
__NB!__ when calling queue inside a queue execution do not block (or await) for it's completion. It will create a deadlock! But, one can always play with the Promises ;)


Also one can create multiple queue. To illustrate the use case, perhaps we would like to have a pipeline to check if user is signed in, authenticate, sign out etc.. and second one for rest calls. 
```typescript
const queue1 = newPrioritizedBlockingQueue(2);
const authData = {
  last: 0,
  signedIn: boolean
}

const signIn = () => queue1.prioritized().enqueue(async () => {
  if (authData.signedIn) {
    throw new Error("You are already signed in!")
  } else {
    authData.last = doSignInStuff();
    authData.signedIn = true;
  }
});

const checkAuthentication = () => queue1.prioritized(1).enqueue(async () => {
  if (!authData.signedIn) {
    throw new Error("You are not signed in!")
  }
  const time = new Date().getTime();
  if (time - authData.last > 60000) {
    authData.last = doMyAuthentication();
  }
});

const signOut = () => queue1.prioritized().enqueue(async () => {
  if (authData.signedIn) {
    signOutUser();
  } else {
    throw new Error("you are already signed out!");
  }
});

const queue2 = newPrioritizedBlockingQueue();
const doRestStuff = async () => 
  queue2.whenReady().enqueue(async () =>  checkAuthentication() );
/*
  Will execute when
  - queue2 prioritized jobs are completed
  - then pushing job to queue1 to be prioritized
  - returning the result form checkAuthentication
 */
await doRestStuff();
```

# API functioins
## Create new queue
- `const queue = newPrioritizedBlockingQueue();` creates new queue with 1 of prioritized queue items
- `const queue = newPrioritizedBlockingQueue(amount);` creates new queue with amount of prioritized queue items

## Exeuting jobs
- `queue.prioritized(?number >= 0).enqueue<ValueType>(job: () => Promise<ValueType>)` returns Promise<ValueType> and will wait for its turn to run prioritizing higher priority jobs
- `queue.whenReady().enqueue<ValueType>(job: () => Promise<ValueType>)` returns Promise<ValueType> and will wait when higher prioritized jobs are done. And then will be executed without any particular order.

## Maintenance
- `queue.jobsWaiting()` returns number of pending jobs
- `queue.size()` returns the amount of prioritized items (the number defined on creation)
- `queue.prioritized(amount?: number).jobsWaiting()` return number of jobs pending in this queue, when `number > 0` then also includes jobs in higher queue
- `queue.prioritized(amount?: number).jobsInQueue()` return number of jobs in this queue
- `queue.whenReady().jobsInQueue()` return number of jobs in this queue
- `queue.whenReady().jobsWaiting()` return number of jobs pending in this queue and in pirioritised queue

# When upgrading from 1.1 to 1.2
As the previous problem had many problems new Class is introduced which brought in more flexibility.
I will keep the previous version for compatibility issues for a while but it will be removed on version 1.3

## Creating
Instead of 
```typescript
const queue = newBlockingPromiseQueue();
```
do
```typescript
const queue = newPrioritizedBlockingQueue();
```
## Qrioritized queue
```typescript
queue.enqueuePriority(async () => {
  /** -- your code --*/
});
```
to
```typescript
queue.prioritized().enqueue(async () => {
  /** -- your code --*/
});
```
## Unprioritized change
```typescript
queue.enqueue(async () => {
  /** -- your code --*/
});

```
to
```typescript
queue.whenReady().enqueue(async () => {
  /** -- your code --*/
});
```
