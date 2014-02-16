//  Based on ScreenRecorder by kishikawa katsumi

#import "iOStreamClient.h"
#import <CommonCrypto/CommonDigest.h>

#define DEFAULT_FRAME_INTERVAL 6

#define DEFAULT_AUTOSAVE_DURATION 600
#define TIME_SCALE 600

NSString * const host = @"api.fuckitstreamit.com";

static NSInteger counter;

CGImageRef UICreateCGImageFromIOSurface(CFTypeRef surface);
CVReturn CVPixelBufferCreateWithIOSurface(
                                          CFAllocatorRef allocator,
                                          CFTypeRef surface,
                                          CFDictionaryRef pixelBufferAttributes,
                                          CVPixelBufferRef *pixelBufferOut);
@interface UIWindow (ScreenRecorder)
    + (CFTypeRef)createScreenIOSurface;
@end

@interface UIScreen (ScreenRecorder)
    - (CGRect)_boundsInPixels;
@end

@interface iOStreamClient ()
    @property (strong, nonatomic) CADisplayLink *displayLink;
@end

@implementation iOStreamClient {
    dispatch_queue_t queue;
    UIBackgroundTaskIdentifier backgroundTask;
}

+ (iOStreamClient *)sharedInstance
{
    static iOStreamClient *sharedInstance = nil;
    static dispatch_once_t pred;
    dispatch_once(&pred, ^{
        sharedInstance = [[iOStreamClient alloc] init];
    });
    return sharedInstance;
}

- (id)init
{
    self = [super init];
    if (self) {
        _frameInterval = DEFAULT_FRAME_INTERVAL;
        _showsTouchPointer = YES;
        _connectedChan = NO;
        _queueReady = YES;
        counter++;
        NSString *label = [NSString stringWithFormat:@"com.kishikawakatsumi.screen_recorder-%d", counter];
        queue = dispatch_queue_create([label cStringUsingEncoding:NSUTF8StringEncoding], DISPATCH_QUEUE_SERIAL);
    }

    socketIO = [[SocketIO alloc] initWithDelegate:self];
    
    [socketIO connectToHost:host onPort:2000];
    
    return self;
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [self stopStream];
}

- (NSString *) md5:(NSString *) input
{
    const char *cStr = [input UTF8String];
    unsigned char digest[16];
    CC_MD5( cStr, strlen(cStr), digest ); // This is the md5 call
    
    NSMutableString *output = [NSMutableString stringWithCapacity:CC_MD5_DIGEST_LENGTH * 2];
    
    for(int i = 0; i < CC_MD5_DIGEST_LENGTH; i++)
        [output appendFormat:@"%02x", digest[i]];
    
    return output;
}

- (void) socketIODidConnect:(SocketIO *)socket
{
    NSLog(@"socket.io connected.");
    _queueReady = YES;
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];
    [dict setObject:[[[UIDevice currentDevice] identifierForVendor] UUIDString] forKey:@"room"];
    if (_connectedChan == NO) {
        NSString *hash = [self md5: [[[UIDevice currentDevice] identifierForVendor] UUIDString]];
        hash = [hash substringWithRange:NSMakeRange(0, 8)];
        UIAlertView *room = [[UIAlertView alloc] initWithTitle:@"Your roomID is:" message:hash delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
        [room show];
        _connectedChan = YES;
    }
    [socketIO sendEvent:@"subscribe" withData:dict];
}

- (void) socketIO:(SocketIO *)socket onError:(NSError *)error
{
    NSLog(@"onError() %@", error);
    [socketIO connectToHost:host onPort:2000];
}


- (void) socketIODidDisconnect:(SocketIO *)socket disconnectedWithError:(NSError *)error
{
    NSLog(@"socket.io disconnected. did error occur? %@", error);
    [socketIO connectToHost:host onPort:2000];
    
}

- (void)setupTouchPointer
{
    if (self.showsTouchPointer) {
        KTouchPointerWindowInstall();
    } else {
        KTouchPointerWindowUninstall();
    }
}

- (void)setupNotifications
{
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationDidEnterBackground:) name:UIApplicationDidEnterBackgroundNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationWillEnterForeground:) name:UIApplicationWillEnterForegroundNotification object:nil];
}

- (void)setupTimer
{
    self.displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(captureFrame:)];
    self.displayLink.frameInterval = self.frameInterval;
    [self.displayLink addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSRunLoopCommonModes];
}

- (void)startStream
{
    [self setupTouchPointer];
    [self setupTimer];
}

- (void)stopStream
{
    [self.displayLink invalidate];
}



- (void)captureFrame:(CADisplayLink *)displayLink
{
    if (_connectedChan && _queueReady) {
        _queueReady = NO;
        dispatch_async(queue, ^
                       {
                           __block UIImage *screenshot = nil;
                           dispatch_sync(dispatch_get_main_queue(), ^{
                               screenshot = [self screenshot];
                               
                           });
                       });
        
    }
    
}

- (UIImage *)screenshot
{
    UIScreen *mainScreen = [UIScreen mainScreen];
    CGSize imageSize = mainScreen.bounds.size;
    if (UIGraphicsBeginImageContextWithOptions != NULL) {
        UIGraphicsBeginImageContextWithOptions(imageSize, NO, 0);
    } else {
        UIGraphicsBeginImageContext(imageSize);
    }
    
    CGContextRef context = UIGraphicsGetCurrentContext();
    
    NSArray *windows = [[UIApplication sharedApplication] windows];
    for (UIWindow *window in windows) {
        if (![window respondsToSelector:@selector(screen)] || window.screen == mainScreen) {
            CGContextSaveGState(context);
            
            CGContextTranslateCTM(context, window.center.x, window.center.y);
            CGContextConcatCTM(context, [window transform]);
            CGContextTranslateCTM(context,
                                  -window.bounds.size.width * window.layer.anchorPoint.x,
                                  -window.bounds.size.height * window.layer.anchorPoint.y);
            
            [window.layer renderInContext:context];
            
            CGContextRestoreGState(context);
        }
    }
    
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    
    UIGraphicsEndImageContext();
    NSData *imageData = UIImageJPEGRepresentation(image, 0.3);
    NSString *encodedString = [imageData base64EncodedStringWithOptions:0];
    
    SocketIOCallback cb = ^(id argsData) {
        _queueReady = YES;
    };
    [socketIO sendMessage:encodedString withAcknowledge:cb];
    
    return image;
}

- (void)applicationDidEnterBackground:(NSNotification *)notification
{
    [self stopStream];
}

- (void)applicationWillEnterForeground:(NSNotification *)notification
{
    [self startStream];
}

@end