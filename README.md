# iOStream API


Presenting mobile apps is a pain in the ass. Collaborating remotely with mobile developers is even worse. Don't let clunky hardware cameras and unrealistic simulators detract from your project or product. Introducing iOStream. Mobile presentations and collaboration made easy.

## Installation

Add all of the files into your XCode project, then add the following code to your application delegate:

(In AppDelegate.h)
```objective-c
#import "iOStreamClient.h"
```

(In AppDelegate.m)
```objective-c
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // Override point for customization after application launch.
    // (Your code here . . .)

    iOStreamClient *client = [iOStreamClient sharedInstance];
    client.frameInterval = 6; //10 FPS
    client.showsTouchPointer = YES; //show the touch pointer
    [client startStream];
    
    return YES;
}
```

## View or share your app's stream

You will be given a unique code every time you launch your app. Share your code with others to allow them to view your app's stream.

You can enter a code at http://fuckitstreamit.com/stream.html. For sharing codes, you can set the "code" GET variable as shown below. Be sure to replace XXXXXXXX with the code you receive from your app.

> http://fuckitstreamit.com/stream.html?code=XXXXXXXX

