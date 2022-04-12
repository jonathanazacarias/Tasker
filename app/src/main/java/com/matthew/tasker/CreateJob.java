package com.matthew.tasker;

import android.content.Intent;
import android.os.Bundle;
import android.os.PowerManager;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Menu;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.afollestad.materialdialogs.DialogAction;
import com.afollestad.materialdialogs.MaterialDialog;
import com.github.javiersantos.materialstyleddialogs.MaterialStyledDialog;
import com.google.android.material.datepicker.MaterialStyledDatePickerDialog;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.navigation.NavigationView;
import com.matthew.tasker.Retrofit.IMyService;
import com.matthew.tasker.Retrofit.RetrofitClient;
import com.rengwuxian.materialedittext.MaterialEditText;

import androidx.annotation.NonNull;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import io.reactivex.Observer;
import io.reactivex.observables.ConnectableObservable;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.functions.Consumer;
import io.reactivex.schedulers.Schedulers;
import retrofit2.Retrofit;

import com.apollographql.apollo3.cache.normalized.NormalizedCache;
import com.apollographql.apollo3.cache.http.HttpCache;
// (...)


public class CreateJob extends AppCompatActivity {
    TextView txt_create_account;
    MaterialEditText edt_title,edt_location,edt_company,edt_date,edt_time;
    Button btn_create;
    CompositeDisposable compositeDisposable = new CompositeDisposable();
    IMyService iMyService;

    @Override
    protected void onStop() {
        compositeDisposable.clear();
        super.onStop();



    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_job);

        Retrofit retrofitClient = RetrofitClient.getInstance();
        iMyService = retrofitClient.create(IMyService.class);

        edt_company = (MaterialEditText)findViewById(R.id.edt_company);
        edt_date = (MaterialEditText)findViewById(R.id.edt_date);
        edt_location = (MaterialEditText)findViewById(R.id.edt_location);
        edt_time = (MaterialEditText)findViewById(R.id.edt_time);
        edt_title = (MaterialEditText)findViewById(R.id.edt_title);

        btn_create = (Button) findViewById(R.id.btn_create);
        btn_create.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view){
                createJob(edt_title.getText().toString(),
                        edt_company.getText().toString(),
                        edt_location.getText().toString(),
                        edt_date.getText().toString(),
                        edt_time.getText().toString());
            }
        });
    }




    private void createJob(String title, String company, String location, String date, String time) {
        compositeDisposable.add(iMyService.createJob(title,company,location,date,time)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new Consumer<String>(){
                    @Override
                    public void accept(String response) throws Exception{
                        Toast.makeText(CreateJob.this, ""+response, Toast.LENGTH_SHORT).show();
                        if(response.equals("Creation successful")){
                            finish();
                        }
                    }
                }, new Consumer<Throwable>() {
                    @Override
                    public void accept(Throwable throwable) throws Exception {
                        Toast.makeText(CreateJob.this, "fail ", Toast.LENGTH_SHORT).show();
                    }
                }));

    }

    public void sendToHome(){
        Intent intent = new Intent(this, MainActivity.class);
//                        EditText editText = (EditText) findViewById(R.id.editTextTextPersonName);
//                        String message = editText.getText().toString();
//                        intent.putExtra(EXTRA_MESSAGE, message);
        startActivity(intent);

    }
}