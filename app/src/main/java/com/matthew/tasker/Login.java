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


public class Login extends AppCompatActivity {
    TextView txt_create_account;
    MaterialEditText edt_login_email,edt_login_password;
    Button btn_login;
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
        setContentView(R.layout.activity_login);

        Retrofit retrofitClient = RetrofitClient.getInstance();
        iMyService = retrofitClient.create(IMyService.class);

        edt_login_email = (MaterialEditText)findViewById(R.id.edt_email);
        edt_login_password = (MaterialEditText)findViewById(R.id.edt_password);

        btn_login = (Button) findViewById(R.id.btn_login);
        btn_login.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view){
                loginUser(edt_login_email.getText().toString(),
                        edt_login_password.getText().toString());
            }
        });

        txt_create_account = (TextView)findViewById(R.id.txt_create_account);
        txt_create_account.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view){
                View register_layout = LayoutInflater.from(Login.this)
                        .inflate(R.layout.register_layout, null);

                new MaterialStyledDialog.Builder(Login.this)
                        .setIcon(R.drawable.ic_user)
                        .setTitle("REGISTRATION")
                        .setDescription("Please fill all fields")
                        .setCustomView(register_layout)
                        .setNegativeText("CANCEL")
                        .onNegative((dialog, which) -> {
                            dialog.dismiss();
                        })
                        .setPositiveText("REGISTER")
                        .onPositive(new MaterialDialog.SingleButtonCallback() {
                            @Override
                            public void onClick(@NonNull MaterialDialog dialog, @NonNull DialogAction which) {
                                MaterialEditText edt_regiseter_email = (MaterialEditText) register_layout.findViewById(R.id.edt_email);
                                MaterialEditText edt_regiseter_name = (MaterialEditText) register_layout.findViewById(R.id.edt_name);
                                MaterialEditText edt_regiseter_password = (MaterialEditText) register_layout.findViewById(R.id.edt_password);


                                if (TextUtils.isEmpty(edt_regiseter_email.getText().toString())) {
                                    Toast.makeText(Login.this, "Email cannot be empty", Toast.LENGTH_SHORT).show();
                                    return;
                                }
                                if (TextUtils.isEmpty(edt_regiseter_name.getText().toString())) {
                                    Toast.makeText(Login.this, "Name cannot be empty", Toast.LENGTH_SHORT).show();
                                    return;
                                }
                                if (TextUtils.isEmpty(edt_regiseter_password.getText().toString())) {
                                    Toast.makeText(Login.this, "Password cannot be empty", Toast.LENGTH_SHORT).show();
                                    return;
                                }

                                registerUser(edt_regiseter_email.getText().toString(),
                                        edt_regiseter_name.getText().toString(),
                                        edt_regiseter_password.getText().toString());


                            }
                        }).show();
            }});


    }




    private void registerUser(String email, String name, String password) {
        compositeDisposable.add(iMyService.registerUser(email,name,password)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new Consumer<String>(){
                    @Override
                    public void accept(String response) throws Exception{
                        Toast.makeText(Login.this, ""+response, Toast.LENGTH_SHORT).show();
                        if(response.charAt(14) != 'u'){
                            Toast.makeText(Login.this, "Account registered", Toast.LENGTH_SHORT).show();
                            sendToHome();
                        }else{
                            Toast.makeText(Login.this, "There was an error making your account", Toast.LENGTH_SHORT).show();
                        }
                    }
                }, new Consumer<Throwable>() {
                    @Override
                    public void accept(Throwable throwable) throws Exception {
                        Toast.makeText(Login.this, "fail "+email+" "+name+" "+password, Toast.LENGTH_SHORT).show();
                    }
                }));

    }


    private void loginUser(String email, String password){
        if(TextUtils.isEmpty(email)){
            Toast.makeText(this,"Email cannot be empty", Toast.LENGTH_SHORT).show();
            return;
        }
        if(TextUtils.isEmpty(password)){
            Toast.makeText(this,"Password cannot be empty", Toast.LENGTH_SHORT).show();
            return;
        }

        compositeDisposable.add(iMyService.loginUser(email,password)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new Consumer<String>() {
                    @Override
                    public void accept(String response) throws Exception {
                        if(response.charAt(7)!= 'u' ){
                            Toast.makeText(Login.this, "Logging in", Toast.LENGTH_SHORT).show();

                            sendToHome();
                        }else{
                            Toast.makeText(Login.this, "Incorrect email and password", Toast.LENGTH_SHORT).show();

                        }

                    }
                }, new Consumer<Throwable>() {
                    @Override
                    public void accept(Throwable throwable) throws Exception {
                        Toast.makeText(Login.this, "fail", Toast.LENGTH_SHORT).show();
                    }
                })
        );
    }
    public void sendToHome(){
        Intent intent = new Intent(this, MainActivity.class);
//                        EditText editText = (EditText) findViewById(R.id.editTextTextPersonName);
//                        String message = editText.getText().toString();
//                        intent.putExtra(EXTRA_MESSAGE, message);
        startActivity(intent);

    }
}