import React from "react";
import {
    Button,
    Text,
    Input,
    InputGroup,
    Container,
    Header,
    Title,
    Content,
    Footer,
    FooterTab,
    Left,
    Right,
    Body,
    Icon,
    List,
    ListItem,
    Form,
    Toast,
    Subtitle
} from "native-base";

import DeviceControl from "./components/DeviceControl";

export default function App() {
    return (
        <Container>
            <Header>
                <Left>
                    <Button transparent>
                        <Icon name="menu" />
                    </Button>
                </Left>
                <Body
                    style={{
                        flex: 3,
                        flexDirection: "row",
                        justifyContent: "center"
                    }}
                >
                    <Right>
                        <Title>UPnP control Hub!!</Title>
                    </Right>
                </Body>
            </Header>
            <Content>
                <DeviceControl />
            </Content>
            <Footer>
                <FooterTab>
                    <Button full>
                        <Text>About</Text>
                    </Button>
                </FooterTab>
            </Footer>
        </Container>
    );
}
