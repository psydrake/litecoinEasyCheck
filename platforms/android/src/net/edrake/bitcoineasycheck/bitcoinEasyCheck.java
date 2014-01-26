/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package net.edrake.bitcoineasycheck;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import android.widget.LinearLayout;
import android.view.View;

import org.apache.cordova.*;
import com.google.ads.*;
//import com.google.analytics.tracking.android.EasyTracker;

import java.util.Timer;
import java.util.TimerTask;

public class bitcoinEasyCheck extends CordovaActivity {

	private final static String ADMOB_AD_UNIT = "ca-app-pub-8928397865273246/7500862619";

	Timer timer;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.init();
        // Set by <content src="index.html" /> in config.xml
        super.loadUrl(Config.getStartUrl());
        //super.loadUrl("file:///android_asset/www/index.html")

        // Google AdMob
		AdView adView = new AdView(this, AdSize.BANNER, ADMOB_AD_UNIT); 
        LinearLayout layout = super.root;
        layout.addView(adView); 

        timer = new Timer(); // Delay the launch of ads; otherwise we get a seg fault
        timer.schedule(new AdMobTask(adView), 5*1000); // delay 5 seconds
    }

    class AdMobTask extends TimerTask {
		private Handler mHandler = new Handler(Looper.getMainLooper());
		private AdView adView;

		public AdMobTask(AdView adView) {
			this.adView = adView;
		}

        @Override
        public void run() {
			mHandler.post(new Runnable() {
				public void run() {
					AdRequest request = new AdRequest();
					//request.setTesting(true);
					adView.loadAd(request);
		            timer.cancel();
				}
			});
        }
    }

	/*
    @Override
    public void onStart() {
      super.onStart();      
      EasyTracker.getInstance(this).activityStart(this); // Google analytics
    }

    @Override
    public void onStop() {
      super.onStop();      
      EasyTracker.getInstance(this).activityStop(this); // Google analytics      
    }
	*/
}

