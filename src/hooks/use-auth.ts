'use client'

import { getAuthenticatedUser } from '@/actions/auth'
// import { updateUser } from '@/actions/user'
import { useQuery } from '@tanstack/react-query'

export function useAuth() {
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const [data, err] = await getAuthenticatedUser()
      if (err) return null
      return data
    },
  })

  // const updateUserAction = useServerAction(updateUser, {
  //   onSuccess: async () => refetch(),
  //   onError: () => toast.error('Failed to update user'),
  // })

  // const onUpdateUser = async (data: { name: string; username: string }) => {
  //   return updateUserAction.execute(data)
  // }

  return {
    user: user!,
    isLoading,
    refetch,
    // isUpdating: updateUserAction.isPending,
    // onUpdateUser,
  }
}
