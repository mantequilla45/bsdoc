// // src/app/components/UserProfile.tsx
// import React, { useState, useEffect } from 'react';
// import { getUser, signOut } from '@/services/Auth/auth'; // Assuming these are in your auth.ts

// interface User {
//     id: string;
//     email: string;
//     first_name: string;
//     last_name: string;
// }

// const UserProfile: React.FC = () => {
//     const [user, setUser] = useState<User | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchUser = async () => {
//             setLoading(true);
//             setError(null);

//             try {
//                 const fetchedUser = await getUser();
//                 if (!fetchedUser) {
//                     throw new Error('Could not fetch user');
//                 }
//                 setUser(fetchedUser);
//             } catch (err: unknown) {
//                 const errorMessage = err instanceof Error ? err.message : 'An unknown error has occurred';
//                 console.log(err)
//                 setError(errorMessage || 'Could not book appointment');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUser();
//     },);

//     const handleSignOut = async () => {
//         try {
//             await signOut();
//             // Redirect to home page or login page after sign out
//             window.location.href = '/';
//         } catch (err: unknown) {
//             const errorMessage = err instanceof Error ? err.message : 'An unknown error has occurred';
//             console.log(err)
//             setError(errorMessage || 'Could not book appointment');
//         }
//     };

//     if (loading) {
//         return <div>Loading user profile...</div>;
//     }

//     if (error) {
//         return <div>Error: {error}</div>;
//     }

//     if (!user) {
//         return <div>Not authenticated</div>;
//     }

//     return (
//         <div>
//             <h2>Your Profile</h2>
//             <p>
//                 <strong>ID:</strong> {user.id}
//             </p>
//             <p>
//                 <strong>Email:</strong> {user.email}
//             </p>
//             <p>
//                 <strong>Name:</strong> {user.first_name} {user.last_name}
//             </p>
//             <button onClick={handleSignOut}>Sign Out</button>
//         </div>
//     );
// };

// export default UserProfile;