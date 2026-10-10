"use client";
import { profile_states } from "@/components/states/PossibleProfileStates";
import { useState, } from 'react';

type ProfileState = typeof profile_states[keyof typeof profile_states];

const ProfileScreen =({state} : {state : ProfileState}) => {
    switch(state){
        case profile_states.Tenant: return <p>The profile is a tennant</p>
        case profile_states.Landlord: return <p>The profile is a Landlord</p>
        case profile_states.Unauthenticated: return <p>The user is not loged in</p>
        default: return <p>THe user is Unauthenticated</p>
    }
}

export function TestStateSceeen(){
    const[currentScreen, setCurrentScreen] = useState<ProfileState>(profile_states.Unauthenticated);
    console.log("Pressed, current: " , currentScreen);
    const nextState = () => setCurrentScreen((prev) =>  ((prev + 1) % 3) as ProfileState);

    return(
        <section>
            <h1>TestStateScreen works</h1>
            <div>
                <h1>This is a test. Clock the button to loop through useStates and enums to show different porfile fucntions</h1>
                <ProfileScreen state={currentScreen}/>
                <button onClick={() => {console.log("Registered press"), nextState()}}>Click ME!</button>
                
            </div>
        </section>
    );

}

