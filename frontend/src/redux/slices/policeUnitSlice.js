import { apiSlice } from "./apiSlice";

export const policeUnitSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTree: builder.query({
      query: () => "/police-units/tree",
      providesTags: ["PoliceUnit"]
    }),
    getScope: builder.query({
      query: () => "/me/unit-scope",
      providesTags: ["PoliceUnit"]
    }),
    createUnit: builder.mutation({
      query: (payload) => ({
        url: "/police-units",
        method: "POST",
        body: payload
      }),
      invalidatesTags: ["PoliceUnit"]
    }),
    updateUnit: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/police-units/${id}`,
        method: "PATCH",
        body: payload
      }),
      invalidatesTags: ["PoliceUnit"]
    }),
    deleteUnit: builder.mutation({
      query: (id) => ({
        url: `/police-units/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["PoliceUnit"]
    })
  })
});

export const {
  useGetTreeQuery,
  useGetScopeQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation
} = policeUnitSlice;
