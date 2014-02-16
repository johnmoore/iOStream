//  Based on ScreenRecorder by kishikawa katsumi

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <TargetConditionals.h>
#import "SocketIO.h"
#import "KTouchPointerWindow.h"

@interface iOStreamClient : NSObject <SocketIODelegate>
{
    SocketIO *socketIO;
}

@property (assign, nonatomic) NSInteger frameInterval;
@property (assign, nonatomic) BOOL showsTouchPointer;
@property (assign, nonatomic) BOOL connectedChan;
@property (assign, nonatomic) BOOL queueReady;

+ (iOStreamClient *)sharedInstance;
- (void)startStream;
- (void)stopStream;

@end
