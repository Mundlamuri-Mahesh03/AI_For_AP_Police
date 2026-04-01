import { apiSlice } from "./apiSlice";

export const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      },
      invalidatesTags: ["Auth"]
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST"
      }),
      async onQueryStarted(arg, { dispatch }) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(apiSlice.util.resetApiState());
      }
    })
  })
});

export const { useLoginMutation, useLogoutMutation } = authSlice;
