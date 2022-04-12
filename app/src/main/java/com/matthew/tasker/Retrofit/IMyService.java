package com.matthew.tasker.Retrofit;

import io.reactivex.Observable;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.GET;
import retrofit2.http.POST;

public interface IMyService {
    @POST("register")
    @FormUrlEncoded
    Observable<String> registerUser(@Field("email") String email,
                                    @Field("name") String name,
                                    @Field("password") String password);

    @POST("createjob")
    @FormUrlEncoded
    Observable<String> createJob(@Field("title") String title,
                                 @Field("company") String company,
                                 @Field("location") String location,
                                 @Field("date") String date,
                                 @Field("time") String time);
    @GET("getjobs")
    Observable<String> getJobs();

    @POST("login")
    @FormUrlEncoded
    Observable<String> loginUser(@Field("email") String email,
                                @Field("password") String password);

}
