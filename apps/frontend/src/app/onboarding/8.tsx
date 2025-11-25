import { router } from "expo-router";
import { useEffect } from "react";
import { useAuthContext } from "@/hooks/use-auth-context";
import { auth } from "@/hooks/use-auth-context";

export default function Connect() {
  const { setOnboarding } = useAuthContext();

  useEffect(() => {
    // Check if user is anonymous (needs account creation)
    // Check both isAnonymous flag AND if user has email (more reliable)
    const isAnonymous = auth.currentUser?.isAnonymous || !auth.currentUser?.email;
    
    if (isAnonymous) {
      router.push("/onboarding/create-account");
    } else {
      // Already has account, proceed normally
      setOnboarding("DONE");
      router.push("/post-onboarding");
    }
  }, [setOnboarding]);

  return null;

  // COMMENTED OUT PLAID BANK CONNECTION FUNCTIONALITY - keeping for future use
  // const { bankConnected, setBankConnected, setOnboarding } = useAuthContext();
  // const [linkToken, setLinkToken] = useState<string | null>(null);
  // const [loading, setLoading] = useState(false);
  //
  // useEffect(() => {
  //   const createLinkToken = async () => {
  //     const { link_token } = await api({
  //       endpoint: "banking-createLinkToken",
  //     });
  //
  //     setLinkToken(link_token);
  //   };
  //
  //   createLinkToken();
  // }, []);
  //
  // const openLink = () => {
  //   if (!linkToken) return;
  //   create({ token: linkToken });
  //   const openProps = {
  //     onSuccess: async (success: LinkSuccess) => {
  //       try {
  //         setLoading(true);
  //         await api({
  //           endpoint: "banking-exchangePublicToken",
  //           data: {
  //             publicToken: success.publicToken,
  //           },
  //         });
  //         setBankConnected(true);
  //         setOnboarding("DONE");
  //         setLoading(false);
  //         router.push("/post-onboarding");
  //       } catch (error) {
  //         console.error(error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     },
  //     onExit: (linkExit: LinkExit) => {
  //       console.log(linkExit);
  //     },
  //   };
  //
  //   open(openProps);
  // };
  //
  // // if (user?.tier) return <Redirect href="/dashboard" />;
  // if (bankConnected) return <Redirect href="/post-onboarding" />;
  // if (loading)
  //   return (
  //     <View className="flex-1 flex-col justify-center items-center gap-2">
  //       <ActivityIndicator size="large" color={colors.accent} />
  //       <Text variant="p" className="font-bold">
  //         Finishing up
  //       </Text>
  //     </View>
  //   );
  //
  // return (
  //   <OnboardingLayout
  //     title="Take the final step"
  //     button={{
  //       text: linkToken ? "Connect bank" : "Setting up",
  //       onPress: openLink,
  //       loading: !linkToken,
  //     }}
  //   >
  //     <Text variant="p">
  //       We're a community of gamblers. That means we know how easy it is to hide
  //       things, lie to ourselves and break promises to ourselves.
  //     </Text>
  //
  //     <Text variant="p">
  //       Only people who truly achieve 7 days sober should receive their
  //       Guardian. To cheat the system, is to scam another struggling gambling
  //       recoverer, just like you, out of their money.
  //     </Text>
  //
  //     <Text variant="p">
  //       So, the final step is to connect your bank account. We automatically
  //       track your transactions. If we notice any deposits to gambling sites,
  //       crypto sites, significant cash withdrawals, transfers, or any other
  //       suspicious activity. We will know. We will keep you accountable.
  //     </Text>
  //   </OnboardingLayout>
  // );
}
