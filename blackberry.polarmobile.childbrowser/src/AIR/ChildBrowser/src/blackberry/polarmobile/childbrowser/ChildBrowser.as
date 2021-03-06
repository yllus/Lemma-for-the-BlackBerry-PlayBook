/**
 * Author: Shane Jonas
 * Child Browser Implementation for the PlayBook
 */

package blackberry.polarmobile.childbrowser
{
    // flash
    import flash.geom.Rectangle;
    import flash.display.Stage;
    import flash.events.MouseEvent;
    import flash.display.Sprite;
    import flash.events.StageOrientationEvent;
    import flash.utils.setTimeout;

    import caurina.transitions.Tweener;

    // qnx 
    import qnx.media.QNXStageWebView;
    import qnx.ui.buttons.IconButton;
    import qnx.ui.skins.buttons.OutlineButtonSkinBlack;

    // webworks
    import webworks.extension.DefaultExtension;

    public class ChildBrowser extends DefaultExtension
    {
        private var childWebView:QNXStageWebView = null;
        private var closeButton:IconButton;
        private var refreshButton:IconButton;
        private var bgshape:Sprite;
        private var loading_bg_shape:Sprite;
        private var browserHeight;
        private var isVisible:Boolean = false;
        private var webViewUI:Sprite;


        //icons
        [Embed(source="assets/close.png")] 
        public static var Close:Class;
        [Embed(source="assets/refresh.png")] 
        public static var Refresh:Class;
        [Embed(source="assets/ajax-spinner-black-bg.gif")] 
        public static var Spinner:Class;

        public function ChildBrowser() 
        {
            super();
            this.isVisible = false
        }

        override public function getFeatureList():Array 
        {
            return new Array ("blackberry.polarmobile.childbrowser");
        }

        private function initBG()
        {
            var self = this;
            webViewUI = new Sprite();
            bgshape = new Sprite();
            bgshape.graphics.beginFill(0x323232);
            bgshape.graphics.drawRect(0,0,webView.stage.stageWidth, webView.stage.stageHeight);
            webViewUI.addChildAt(bgshape, 0);

            //build buttons
            //this.initUI();

            webViewUI.y = webView.stage.stageHeight;
            webView.stage.addChild(webViewUI);

            function loaded(){
              setTimeout(function(){
                childWebView.stage = webView.stage;
                childWebView.zOrder = 1;
                self.isVisible = true;
              }, 1000);
            }

            Tweener.addTween(webViewUI, {
              y: 0,
              time: 1,
              transition: 'easeOutExpo',
              onComplete: loaded
            });
        }

        public function clearCookies()
        {
          //if we dont have a webview, make one and put it in the background
          this.createBrowser()
          //clear the webviews cookies
          childWebView.clearCookies();
          childWebView.stage = null;
          //childWebView.dispose();
          //childWebView = null;
        }

        private function createBrowser()
        {
          if (childWebView == null) 
          {
              childWebView = new QNXStageWebView("ChildBrowser");
              childWebView.stage = webView.stage;
              childWebView.viewPort = new Rectangle(0,0,webView.stage.stageWidth,browserHeight);
              childWebView.zOrder = -1;
              this.isVisible = true
              // events
              webView.stage.addEventListener(StageOrientationEvent.ORIENTATION_CHANGE, onOrientationChange);
          }
        }

        public function loadURL(url:String)
        {
            var self = this;
            browserHeight = webView.stage.stageHeight;
            //if we dont have a webview, make one and put it in the background
            this.createBrowser();
            //put webview behind stage
            webView.zOrder = -1;
            //load this url
            childWebView.loadURL(url);
            this.initBG();
        }

        private function onOrientationChange(event:StageOrientationEvent)
        {
           var self = this
           this.removeUI();
           this.initBG()
           childWebView.viewPort = new Rectangle(0,0,bgshape.width,bgshape.height);
        }

        public function getLocation():String
        {
            return childWebView.location;
        }

        public function forward()
        {
            childWebView.historyForward();
        }

        public function back()
        {
            childWebView.historyBack();
        }

        public function refresh()
        {
            childWebView.reload();
        }

        public function close()
        {
          childWebView.stage = null;
          childWebView.dispose();
          childWebView = null;

          Tweener.addTween(webViewUI, {
            y: webView.stage.stageHeight,
            delay: 0.5,
            time: 1,
            transition: 'easeOutExpo',
            onComplete: closeUI
          });
        }

        private function closeUI()
        {
          // the `dispose` method does not work when running inside of webworks,
          // as it closes then main `webView` instance. as a temp. work-around,
          // we hide the child
          this.removeUI();
          webView.stage.removeChild(webViewUI);
          this.isVisible = false;
          webView.zOrder = 1;
        }

        public function closeCLICK(e:MouseEvent)
        {
          this.close();
        }

        public function refreshCLICK(e:MouseEvent)
        {
          this.refresh();
        }

        private function removeUI()
        {
          removeChild(bgshape);
          //removeChild(closeButton);
          //removeChild(refreshButton)
        }

        //close button
        private function addClose()
        {
          closeButton = new IconButton();
          closeButton.setIcon(new Close());

          closeButton.setSize(266, 50);
          closeButton.setPosition(-5, 0);
            
          closeButton.setSkin(new OutlineButtonSkinBlack());
          closeButton.addEventListener(MouseEvent.CLICK, closeCLICK);
          addChild(closeButton);
        }

        //refresh button
        private function addRefresh()
        {
          refreshButton = new IconButton();
          refreshButton.setIcon(new Refresh());
          refreshButton.setSize(266, 50);
          refreshButton.setPosition(256, 0);
          refreshButton.setSkin(new OutlineButtonSkinBlack())
          refreshButton.addEventListener(MouseEvent.CLICK, refreshCLICK);
          addChild(refreshButton);
        }

        // UI Buttons
        private function initUI()
        {
          this.addClose();
          this.addRefresh();
        }

        public function getVisible():Boolean
        {
          return this.isVisible; 
        }

        // our own addChild implementation
        // maps back to stage of WebWorkAppTemplate.as
        private function addChild(obj)
        {
          webViewUI.addChild(obj);
          //always set added obj's to top
          //webViewUI.setChildIndex(obj, webView.stage.numChildren -1);
        }

        private function removeChild(obj)
        {
          webViewUI.removeChild(obj);
        }

    }
}
