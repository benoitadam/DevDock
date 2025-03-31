import { IMsgReadonly } from "@/helpers/Msg";
import { useEffect, useState } from "react";

interface UseMsg {
  <T = any>(msg: IMsgReadonly<T>): T;
  <T = any>(msg: IMsgReadonly<T> | null | undefined): T | undefined;
}

let i=0;

const useMsg = (<T = any>(msg: IMsgReadonly<T> | null | undefined): T | undefined => {
  const setState = useState(0)[1];
  useEffect(() => {
    setState(i++)
    return msg?.on(() => setState(i++))
  }, [msg]);
  return msg ? msg.get() : undefined;
}) as UseMsg;

export default useMsg;