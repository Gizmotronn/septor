import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useState } from "react";
import PromptForm from "../components/Proompts/PromptCheck";
import ChatGPTComponent from "../components/Proompts/ChatConnection";
import GptBot from "../components/Proompts/Message";

export default function Home() {
    const session = useSession();
    const supabase = useSupabaseClient();

    if (session) {
        return (
            <>
                <p>{session?.user?.id}</p>
                {/* <PromptForm /> */}
                {/* <ChatGPTComponent /> */}
                <GptBot />
                {/* <ChatGPTComponent /> */}
            </>
        )
    }

    return (
        <p>Please log in.</p>
    )
}