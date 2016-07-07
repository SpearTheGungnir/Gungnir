package com.example.gj.gungnir;

import android.graphics.Color;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity implements View.OnClickListener {

    private LinearLayout home;
    private LinearLayout nearby;
    private LinearLayout group;
    private LinearLayout mine;

    private ImageView home_png;
    private ImageView nearby_png;
    private ImageView group_png;
    private ImageView mine_png;

    private TextView home_txt;
    private TextView nearby_txt;
    private TextView group_txt;
    private TextView mine_txt;

    private Fragment homeFragment;
    private Fragment nearbyFragment;
    private Fragment groupFragment;
    private Fragment mineFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        initView();
        initEvent();
        initFragment(0);
    }

    private void initFragment(int index) {
        FragmentManager fragmentManager = getSupportFragmentManager();
        FragmentTransaction transaction = fragmentManager.beginTransaction();
        hideFragment(transaction);
        switch(index) {
            case 0:
                if (homeFragment == null) {
                    homeFragment = new HomeFragment();
                    transaction.add(R.id.vp_content, homeFragment);
                } else {
                    transaction.show(homeFragment);
                }
                break;
            case 1:
                if (nearbyFragment == null) {
                    nearbyFragment = new NearbyFragment();
                    transaction.add(R.id.vp_content, nearbyFragment);
                } else {
                    transaction.show(nearbyFragment);
                }
                break;
            case 2:
                if (groupFragment == null) {
                    groupFragment = new GroupFragment();
                    transaction.add(R.id.vp_content, groupFragment);
                } else {
                    transaction.show(groupFragment);
                }
                break;
            case 3:
                if (mineFragment == null) {
                    mineFragment = new NearbyFragment();
                    transaction.add(R.id.vp_content, mineFragment);
                } else {
                    transaction.show(mineFragment);
                }
                break;
            default:
                break;
        }
        transaction.commit();
    }

    private void hideFragment(FragmentTransaction transaction) {
        if (homeFragment != null) {
            transaction.hide(homeFragment);
        }
        if (nearbyFragment != null) {
            transaction.hide(nearbyFragment);
        }
        if (groupFragment != null) {
            transaction.hide(groupFragment);
        }
        if (mineFragment != null) {
            transaction.hide(mineFragment);
        }
    }

    private void  initEvent() {
        home.setOnClickListener(this);
        nearby.setOnClickListener(this);
        group.setOnClickListener(this);
        mine.setOnClickListener(this);
    }

    private void initView() {
        this.home = (LinearLayout)findViewById(R.id.home);
        this.nearby = (LinearLayout)findViewById(R.id.nearby);
        this.group = (LinearLayout)findViewById(R.id.group);
        this.mine = (LinearLayout)findViewById(R.id.mine);

        this.home_png = (ImageView) findViewById(R.id.home_png);
        this.nearby_png = (ImageView) findViewById(R.id.nearby_png);
        this.group_png = (ImageView) findViewById(R.id.group_png);
        this.mine_png = (ImageView) findViewById(R.id.mine_png);

        this.home_txt = (TextView) findViewById(R.id.home_txt);
        this.nearby_txt = (TextView) findViewById(R.id.nearby_txt);
        this.group_txt = (TextView) findViewById(R.id.group_txt);
        this.mine_txt = (TextView) findViewById(R.id.mine_txt);
    }

    public void onClick(View view) {
        restartButton();
        switch (view.getId()) {
            case R.id.home:
                home_png.setImageResource(R.drawable.home2);
                home_txt.setTextColor(Color.rgb(255,204,50));
                initFragment(0);
                break;
            case R.id.nearby:
                nearby_png.setImageResource(R.drawable.nearby2);
                nearby_txt.setTextColor(Color.rgb(255,204,50));
                initFragment(1);
                break;
            case R.id.group:
                group_png.setImageResource(R.drawable.group2);
                group_txt.setTextColor(Color.rgb(255,204,50));
                initFragment(2);
                break;
            case R.id.mine:
                mine_png.setImageResource(R.drawable.user2);
                mine_txt.setTextColor(Color.rgb(255,204,50));
                initFragment(3);
                break;
            default:
                break;
        }
    }

    private void restartButton() {
        home_png.setImageResource(R.drawable.home);
        nearby_png.setImageResource(R.drawable.nearby);
        group_png.setImageResource(R.drawable.group);
        mine_png.setImageResource(R.drawable.user);

        home_txt.setTextColor(Color.rgb(0,0,0));
        nearby_txt.setTextColor(Color.rgb(0,0,0));
        group_txt.setTextColor(Color.rgb(0,0,0));
        mine_txt.setTextColor(Color.rgb(0,0,0));

    }
}
