import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useState } from "react";
import PromptForm from "../components/Proompts/PromptCheck";
import ChatGPTComponent from "../components/Proompts/ChatConnection";
import GptBot from "../components/Proompts/Message";
import Login from "./login";
import PromptCheckPage from "./tests/PromptCheck";

export default function Home() {
    const session = useSession();
    const supabase = useSupabaseClient();

    if (session) {
        return (
            <>
                <PromptCheckPage />
            </>
        )
    }

    return (
        <Login />
    )
}